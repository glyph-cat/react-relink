import {
  createSource,
  useRelinkState,
  useRelinkValue,
  useResetRelinkState,
} from 'react-relink'

const SOURCE_KEY = 'todo-source'
const DEFAULT_VALUE = ''

export const EditorSource = createSource({
  key: SOURCE_KEY,
  default: DEFAULT_VALUE,
})

export function useEditorState() {
  return useRelinkState(EditorSource)
}

export function useEditorValue() {
  return useRelinkValue(EditorSource)
}

export function useResetEditorState() {
  return useResetRelinkState(EditorSource)
}
