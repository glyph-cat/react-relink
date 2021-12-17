# Special Notes

## A
Special case: If unknown is used, there would be errors everywhere else because all sources have some sort of type that just doesn't overlap with unknown.

## B
~~In some places '@ts-ignore' is used to test what would happen if the wrong type is provided in a context JavaScript.~~

## C
Entry point changed from `src/index.ts` to `src/bundle.ts` to prevent VSCode Intellisense from importing items directly from `src/index.ts`. For most of the time, this happens when trying to import from `src/schema.ts`
