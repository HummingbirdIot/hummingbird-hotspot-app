import { cleanup, renderWithNav } from '../utils/testUtils'
import HotspotsScreen from '../features/hotspots_old/root/HotspotsScreen'

afterEach(cleanup)

describe('Test Hotspot Screen', () => {
  it('renders HotspotScreen.tsx', async () => {
    const hotspotScreen = renderWithNav(HotspotsScreen)
    const title = hotspotScreen.findByText('Add a\nHummingbird Miner')
    expect(title).toBeDefined()
  })
})
