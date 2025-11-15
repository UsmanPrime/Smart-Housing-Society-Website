import { useState } from 'react'

export default function CommentBox({ onSubmit, submitting }) {
  const [text, setText] = useState('')
  return (
    <div className="mt-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full bg-[#07164a] text-white rounded-lg p-3"
        placeholder="Write a comment..."
        rows={3}
      />
      <div className="flex justify-end mt-2">
        <button
          disabled={!text.trim() || submitting}
          onClick={() => onSubmit(text).then(() => setText(''))}
          className="bg-[#07164a] hover:bg-[#0a1f6b] text-white px-4 py-2 rounded-md disabled:opacity-60"
        >
          {submitting ? 'Posting...' : 'Post Comment'}
        </button>
      </div>
    </div>
  )
}