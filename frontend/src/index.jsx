import * as ReactDOMclient from 'react-dom/client'
import App from './Layout'

const container = document.getElementById('root')
const root = ReactDOMclient.createRoot(container)
root.render(<App/>)