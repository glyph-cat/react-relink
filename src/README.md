# Special Notes

## A
Special case: If unknown is used, there would be errors everywhere else because all sources have some sort of type that just doesn't overlap with unknown.

## B
~~In some places '@ts-ignore' is used to test what would happen if the wrong type is provided in a context JavaScript.~~

## C
Entry point changed from `src/index.ts` to `src/bundle.ts` to prevent VSCode Intellisense from importing items directly from `src/index.ts`. For most of the time, this happens when trying to import from `src/schema.ts`

## D
Arrow class methods are used for internal data types. Class method binding is used for exposed data types because only then it will be interpreted by VS Code as a method (with purple icon) instead of a property (blue icon)
