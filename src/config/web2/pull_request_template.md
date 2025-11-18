# Web2Json data source update

## Description
Summarize the change, whether it's adding a new source, modifying an existing one, or removing a source.
List the `sourceId`\(s\) affected by this change.

## Background and motivation
Motivation for the change, business use-case if adding new endpoints.

## API rate limits and pricing
Provide details for any added/modified endpoints:
- Full endpoint url.
  - Pricing details (if applicable):
    - Link to pricing page.
    - Estimated cost (per request / per month).
    - Free tier available? (Yes / No).
  - Rate limits / quotas (requests per minute/hour/day).

## Request fee
Suggested attestation request fee in FLR/SGB for the source if endpoints were added or modified.

## Additional notes (optional)

## Checklist
- [ ] I applied changes to `src/config/web2/web2-json-sources.ts`. 
- [ ] I verified endpoint responses with `curl` or a live integration.
- [ ] I did not commit API keys or secrets.
- [ ] CI is passing.