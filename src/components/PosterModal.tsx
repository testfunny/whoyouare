import { useEffect, useState } from 'react'

export default function PosterModal({ url, onClose }: { url: string; onClose: () => void }) {
  const [tip, setTip] = useState('海报已生成')

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
