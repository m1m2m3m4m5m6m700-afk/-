# Tool Development Guide

## Tool contract

Every publishable tool must define a deterministic verification contract covering:

- render/readiness
- user interaction
- expected output
- explicit error behavior
- negative inputs
- boundary inputs
- repeatability
- evidence

## Result verification

The oracle must compare the actual result to an expected result with the strongest meaningful comparison:

- byte-for-byte for binary output
- exact strings for deterministic text output
- parsed structural equality for JSON/ZIP/document structures
- semantic assertions only when exact equality is impossible

An assertion such as `result exists` is not sufficient to mark a tool verified.

## Publication lifecycle

`candidate → verified → public`

`candidate` may be incomplete and must remain isolated from public discovery. `verified` requires the complete strict gate. `public` requires verified status plus registry and route consistency.

## Test layers

1. Pure logic: deterministic behavior and edge cases.
2. Integration: tool runtime, route, and state boundaries.
3. Browser: actual user interaction in Chromium.
4. Reliability: repeated execution and isolation.
5. Security/performance: input safety and resource budgets.
6. Mutation/fault injection: prove that tests fail when the implementation is intentionally wrong.

## Evidence

A successful tool test must provide machine-readable evidence sufficient to answer:

- which tool was tested?
- which input was used?
- what was expected?
- what was actually produced?
- which commit produced the result?
- which browser/test run produced the evidence?

## Rule

Never promote an untested tool by copying metadata from another tool. The new tool must have its own contract and proof.
