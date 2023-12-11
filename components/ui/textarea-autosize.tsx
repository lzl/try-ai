// code copy from https://github.com/Yidadaa/ChatGPT-Next-Web/blob/b90dfb48ee0446fdcb567dae2b77220508f62f0d/app/components/chat.tsx
import * as React from 'react'

const DEFAULT_FONT_SIZE = '16px'
const DEFAULT_LINE_HEIGHT = '24px'

function useSubmitHandler(
  submitKey:
    | 'Enter'
    | 'AltEnter'
    | 'CtrlEnter'
    | 'ShiftEnter'
    | 'MetaEnter' = 'Enter'
) {
  const isComposing = React.useRef(false)

  React.useEffect(() => {
    const onCompositionStart = () => {
      isComposing.current = true
    }
    const onCompositionEnd = () => {
      isComposing.current = false
    }

    window.addEventListener('compositionstart', onCompositionStart)
    window.addEventListener('compositionend', onCompositionEnd)

    return () => {
      window.removeEventListener('compositionstart', onCompositionStart)
      window.removeEventListener('compositionend', onCompositionEnd)
    }
  }, [])

  const shouldSubmit = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Enter') return false
    if (e.key === 'Enter' && (e.nativeEvent.isComposing || isComposing.current))
      return false
    return (
      (submitKey === 'AltEnter' && e.altKey) ||
      (submitKey === 'CtrlEnter' && e.ctrlKey) ||
      (submitKey === 'ShiftEnter' && e.shiftKey) ||
      (submitKey === 'MetaEnter' && e.metaKey) ||
      (submitKey === 'Enter' &&
        !e.altKey &&
        !e.ctrlKey &&
        !e.shiftKey &&
        !e.metaKey)
    )
  }

  return {
    submitKey,
    shouldSubmit,
  }
}

function getOrCreateMeasureDom(
  defaultDom: HTMLElement,
  id: string,
  init?: (dom: HTMLElement) => void
) {
  let dom = document.getElementById(id)

  if (!dom) {
    dom = document.createElement('span')
    dom.style.position = 'absolute'
    dom.style.wordBreak = 'break-word'
    dom.style.fontSize = defaultDom.style.fontSize || DEFAULT_FONT_SIZE
    dom.style.lineHeight = defaultDom.style.lineHeight || DEFAULT_LINE_HEIGHT
    dom.style.transform = 'translateY(-200vh)'
    dom.style.pointerEvents = 'none'
    dom.style.opacity = '0'
    dom.id = id
    document.body.appendChild(dom)
    init?.(dom)
  }

  return dom!
}

function getDomContentWidth(dom: HTMLElement) {
  const style = window.getComputedStyle(dom)
  const paddingWidth =
    parseFloat(style.paddingLeft) + parseFloat(style.paddingRight)
  const width = dom.clientWidth - paddingWidth
  return width
}

function autoGrowTextArea(dom: HTMLTextAreaElement) {
  const measureDom = getOrCreateMeasureDom(dom, '__measure')
  const singleLineDom = getOrCreateMeasureDom(
    dom,
    '__single_measure',
    (dom) => {
      dom.innerText = 'TEXT_FOR_MEASURE'
    }
  )

  const width = getDomContentWidth(dom)
  measureDom.style.width = width + 'px'
  measureDom.innerText = dom.value !== '' ? dom.value : '1'
  measureDom.style.fontSize = dom.style.fontSize || DEFAULT_FONT_SIZE
  measureDom.style.lineHeight = dom.style.lineHeight || DEFAULT_LINE_HEIGHT
  const valueArr = dom.value.split('\n')
  const valueArrLen = valueArr.length
  const endWithEmptyLine = valueArrLen > 1 && !valueArr[valueArrLen - 1].trim()
  const height = Math.max(
    parseFloat(window.getComputedStyle(measureDom).height),
    +measureDom.style.lineHeight.replace('px', '')
  )
  const singleLineHeight = parseFloat(
    window.getComputedStyle(singleLineDom).height
  )

  const rows =
    Math.round(height / singleLineHeight) + (endWithEmptyLine ? 1 : 0)
  return rows
}

function useInputRows(
  inputRef: React.RefObject<HTMLTextAreaElement>,
  userInput: string
) {
  const [inputRows, setInputRows] = React.useState(1)

  React.useEffect(() => {
    const rows = inputRef.current ? autoGrowTextArea(inputRef.current) : 1
    const inputRows = Math.min(20, rows)
    setInputRows(inputRows)
  }, [userInput, inputRef])

  return inputRows
}

interface IProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  input: string
  onInput: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmit: (content: string) => void
}

export default function TextareaAutosize({
  input,
  onInput,
  handleSubmit,
  ...props
}: IProps) {
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const { shouldSubmit } = useSubmitHandler()
  const inputRows = useInputRows(inputRef, input)

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (shouldSubmit(e)) {
      e.preventDefault()
      handleSubmit(input)
    }
  }

  return (
    <textarea
      ref={inputRef}
      className="w-full resize-none rounded-md border p-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
      value={input}
      onInput={onInput}
      onKeyDown={onInputKeyDown}
      rows={inputRows}
      autoFocus={true}
      style={{ fontSize: DEFAULT_FONT_SIZE, lineHeight: DEFAULT_LINE_HEIGHT }}
      {...props}
    />
  )
}
