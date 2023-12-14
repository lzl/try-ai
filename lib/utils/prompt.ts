import { Message } from 'ai'

const MAX_TOKEN_LENGTH = 2000

const makeSummaryPrompt = (summary?: string) => {
  return summary
    ? [
        {
          role: 'system',
          content: `This is a summary of the chat history as a recap: ${summary}\n\nThe following messages is a continuation of the conversation.`,
        },
      ]
    : []
}

const summarizePrompt = [
  {
    role: 'system',
    content:
      'Summarize the discussion briefly in 200 words or less to use as a prompt for future context.',
  },
]

function estimateTokenLength(input: string): number {
  let tokenLength = 0

  for (let i = 0; i < input.length; i++) {
    const charCode = input.charCodeAt(i)

    if (charCode < 128) {
      // ASCII character
      if (charCode <= 122 && charCode >= 65) {
        // a-Z
        tokenLength += 0.25
      } else {
        tokenLength += 0.5
      }
    } else {
      // Unicode character
      tokenLength += 1.5
    }
  }

  return tokenLength
}

function countMessages(msgs: Message[]) {
  return msgs.reduce((pre, cur) => pre + estimateTokenLength(cur.content), 0)
}

function sliceMessages(msg: any[], maxLength = MAX_TOKEN_LENGTH) {
  let length = 0
  let index = msg.length
  while (length < maxLength && index > 0) {
    length += estimateTokenLength(msg[index - 1].content)
    index--
  }
  return msg.slice(index)
}

// // Summarize the chat history
// const historyMsgLength = countMessages(newMessages)
// console.log('historyMsgLength 2:', historyMsgLength)
// if (historyMsgLength > MAX_TOKEN_LENGTH) {
//   const messages = [
//     ...summaryMessages,
//     ...latestMessages,
//     ...completionMessage,
//     ...summarizePrompt,
//   ]
//   console.log('messages:', messages)
//   const response = await openai.chat.completions.create({
//     model: 'gpt-3.5-turbo',
//     messages,
//   })
//   const summary = response.choices[0].message.content
//   console.log('summary:', summary)
//   await kv.hset(`chat:${id}`, { summary })
// }
