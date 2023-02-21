import type { Request } from "express";
import createHttpError from "http-errors";
import { createHash } from "node:crypto";
import { v4 as uuid } from "uuid";

type Hash = string;
type UUID = string;

type SumSet = number[];
type SumResult = number;
type SumSetData = { set: SumSet; sum: SumResult; id: UUID; hash: Hash };

type SumSetResponseData = Omit<SumSetData, "hash">;

const sumsCache = new Map<UUID, SumSetData>();
const hashMap = new Map<Hash, UUID>();

function isSumSetResponseData(data: unknown): data is SumSetResponseData {
  const d = data as SumSetData;
  return (
    Array.isArray(d.set) && Number.isInteger(d.sum) && "string" === typeof d.id
  );
}

/**
 * sort input, so we treat e.g. [2,1] as a duplicate of [1,2] for caching purposes
 */
function normalizeSet(set: SumSet): SumSet {
  return set.sort((a, b) => {
    if (a > b) {
      return 1;
    } else if (a < b) {
      return -1;
    } else {
      return 0;
    }
  });
}

/**
 * Perform the actual summation
 */
function sumSet(set: SumSet): SumResult {
  return set.reduce((prev, curr) => prev + curr, 0);
}

/**
 * Create a sha256 hash of a normalized set
 * @param set
 * @returns
 */
function hashSet(set: SumSet): string {
  const hash = createHash("sha256");

  set.forEach((n) => {
    hash.update(n.toString());
  });
  return hash.digest("hex");
}

function handleGet(req: Request): SumSetResponseData | Error {
  const uuid = req.params["id"];
  if (undefined === uuid) {
    return createHttpError(500, `no :id param available in handleGet()`);
  }

  if (sumsCache.has(uuid)) {
    const cacheData = sumsCache.get(uuid)!;

    const { set, sum, id } = cacheData;
    return { set: [...set], sum, id };
  }

  return createHttpError(404);
}

function handlePost(req: Request): SumSetResponseData {
  const { set } = req.body;
  if (undefined === set) {
    throw createHttpError(400, `Missing \`set\` key in request body`);
  }
  if (!Array.isArray(set)) {
    throw createHttpError(400, `\`set\` key must be an array of integers`);
  }
  if (undefined !== set.find((n) => !Number.isInteger(n))) {
    throw createHttpError(400, `\`set\` key must be an array of integers`);
  }

  const normalized = normalizeSet(set);
  const hash = hashSet(normalized);

  if (hashMap.has(hash)) {
    console.log(`sums.handlePost cache HIT!`);
    const uuid = hashMap.get(hash);
    // @TODO 500 error here if uuid is undefined or if sumsCache lacks the ID
    const data = sumsCache.get(uuid!)!;
    const { set, sum, id } = data;
    return { set, sum, id };
  }
  console.log(`sums.handlePost cache MISS`);

  const id = uuid();

  const responseData: SumSetResponseData = {
    set: normalized,
    sum: sumSet(normalized),
    id,
  };

  const cacheData = { ...responseData, hash };
  sumsCache.set(id, cacheData);
  hashMap.set(hash, id);

  return responseData;
}

export { handleGet, handlePost, isSumSetResponseData };
