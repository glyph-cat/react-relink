/**
 * @internal
 * Deprecated: Try not to use it anymore because any code using object
 * references will break if process if split into multiple instances.
 * Story: There is a case where React Context could not work in NextJS v12
 * (configured with babel) when dynamically importing components for manual SSR
 * because the value passed to <Provider> run on one instance, while the
 * components consume from a <Provider> from another instance. If you declare
 * a constant `new Date().toISOString()` and log it, you would see that the date
 * strings are different. One created at the time the main process is spawned,
 * another one created at the time the dynamically required file is in use.
 *
 * See:
 * - https://github.com/vercel/next.js/issues/34308
 * - https://github.com/vercel/next.js/discussions/34441
 * - https://github.com/glyph-cat/nextjs-dynamic-require-inconsistency
 */
export type ObjectMarker = Record<never, never>
// TODO: Document this in changelog

export type Nullable<T> = T | null
