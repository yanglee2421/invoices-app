import { Root } from '@renderer/router/root'
import { QueryProvider } from './components/query'

function App(): React.JSX.Element {
  return (
    <QueryProvider>
      <Root />
    </QueryProvider>
  )
}

export default App
