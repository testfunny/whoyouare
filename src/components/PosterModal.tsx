import { useEffect, useState } from 'react'
import { track } from '@vercel/analytics'

export default function PosterModal({
  url,
  onClose,
  series,
}: {
  url: string
  onClose: () => void
  series?: string
}) {
  const [tip, setTip] = useState('海报已生成')

  useEffect(() => {
    // poster_save 的口径是"用户点击生成并打开海报"——移动端长按保存动作
    // 在 web 端无法探测,打开海报已是最强的保存意向信号
    try { track('poster_save', { series: series ?? '' }) } catch { /* ignore */ }
  }, [series])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="modal-mask" onClick={onClose}>
      <div className="modal-body" onClick={e => e.stopPropagation()}>
        <img src={url} alt="结果海报" />
        <div className="modal-tip">{tip}<br />长按图片保存到相册 / 转发好友</div>
        <button className="modal-close" onClick={onClose}>关闭</button>
      </div>
    </div>
  )
}
