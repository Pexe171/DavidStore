import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import App from '../App'

describe('App', () => {
  it('renderiza a página inicial por padrão', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: /david store/i })).toBeInTheDocument()
  })
})
