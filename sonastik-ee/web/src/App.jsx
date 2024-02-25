import { FatalErrorBoundary, RedwoodProvider } from '@redwoodjs/web'
import { RedwoodApolloProvider } from '@redwoodjs/web/apollo'
import { createTheme, MantineProvider } from '@mantine/core'
import FatalErrorPage from 'src/pages/FatalErrorPage'
import Routes from 'src/Routes'

const theme = createTheme({
  /** Your theme override here */
})

const App = () => (
  <MantineProvider theme={theme}>
    <FatalErrorBoundary page={FatalErrorPage}>
      <RedwoodProvider titleTemplate="%PageTitle | %AppTitle">
        <RedwoodApolloProvider>
          <Routes />
        </RedwoodApolloProvider>
      </RedwoodProvider>
    </FatalErrorBoundary>
  </MantineProvider>
)

export default App
