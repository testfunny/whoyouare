import { useEffect, useState } from 'react'
import { parseHash } from './lib/share'
import Home from './screens/Home'
import Quiz from './screens/Quiz'
import ResultZh from './screens/ResultZh'
import ResultHid from './screens/ResultHid'
import ResultCf from './screens/ResultCf'
import CfFlow from './screens/CfFlow'
import Unlock from './screens/Unlock'

export default function App() {
  const [route, setRoute] = useState(parseHash())

  useEffect(() => {
    const f = () => {
      setRoute(parseHash())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', f)
    return () => window.removeEventListener('hashchange', f)
  }, [])

  const { path, params } = route
  let body
  if (path === '/quiz/zh') body = <Quiz key="zh" testId="zh" params={params} />
  else if (path === '/quiz/hid') body = <Quiz key="hid" testId="hid" params={params} />
  else if (path === '/quiz/cf') body = <CfFlow key="cf" params={params} />
  else if (path === '/result/zh') body = <ResultZh params={params} />
  else if (path === '/result/hid') body = <ResultHid params={params} />
  else if (path === '/result/cf') body = <ResultCf params={params} />
  else if (path === '/unlock') body = <Unlock key={params.get('p') || 'hid'} params={params} />
  else body = <Home params={params} />

  return <div className="shell">{body}</div>
}
