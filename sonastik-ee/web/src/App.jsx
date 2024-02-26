import '@mantine/core/styles.css'
import { FatalErrorBoundary, RedwoodProvider } from '@redwoodjs/web'
import { RedwoodApolloProvider } from '@redwoodjs/web/apollo'
import { MantineProvider } from '@mantine/core'
import mantineConfig from '../config/mantine.config'
import FatalErrorPage from 'src/pages/FatalErrorPage'
import Routes from 'src/Routes'

const App = () => (
  <FatalErrorBoundary page={FatalErrorPage}>
    <RedwoodProvider titleTemplate="%PageTitle | %AppTitle">
      <MantineProvider theme={mantineConfig}>
        <RedwoodApolloProvider>
          <Routes />
        </RedwoodApolloProvider>
      </MantineProvider>
    </RedwoodProvider>
  </FatalErrorBoundary>
)

export default App
