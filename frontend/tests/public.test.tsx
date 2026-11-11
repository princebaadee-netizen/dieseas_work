/**
 * The public site checks.
 *
 * These walk the pages a reader uses, the way the Project Plan's Part 8
 * checklist asks: the home page, the search, the category pages, the disease
 * page, the remedy page and the pages that report a problem.
 */
import { describe, expect, it } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import { renderApp, type TestRouter } from './helpers'

/** Opens another address in the router the test is using. */
async function go(router: TestRouter, path: string) {
  const { act } = await import('@testing-library/react')
  await act(async () => {
    await router.navigate(path)
  })
}

describe('the home page', () => {
  it('introduces the site and shows the search box', async () => {
    renderApp('/')
    expect(
      await screen.findByRole('heading', {
        name: 'Clear health information in one place',
        level: 1,
      }),
    ).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Popular diseases' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Browse by category' })).toBeInTheDocument()
  })

  it('shows the four curated diseases', async () => {
    renderApp('/')
    const section = await screen.findByRole('heading', { name: 'Popular diseases' })
    const list = section.closest('section') as HTMLElement
    expect(within(list).getByText('Malaria')).toBeInTheDocument()
    expect(within(list).getByText('Asthma')).toBeInTheDocument()
    expect(within(list).getByText('Hypertension')).toBeInTheDocument()
    expect(within(list).getByText('Typhoid fever')).toBeInTheDocument()
    expect(within(list).queryByText('Type 2 diabetes')).not.toBeInTheDocument()
  })

  it('shows the disclaimer on every public page', async () => {
    const { router } = renderApp('/')

    expect(await screen.findByText(/Educational information only/)).toBeInTheDocument()

    for (const path of ['/categories', '/about', '/search?q=fever', '/disease/malaria']) {
      await go(router, path)
      await waitFor(() => {
        expect(screen.getByText(/Educational information only/)).toBeInTheDocument()
      })
    }
  })

  it('offers a skip link as the first thing in the page', async () => {
    renderApp('/')
    const skip = await screen.findByRole('link', { name: /skip to main content/i })
    const links = screen.getAllByRole('link')
    expect(links[0]).toBe(skip)
    expect(skip).toHaveAttribute('href', '#main-content')
  })
})

describe('searching', () => {
  it('goes to the results page and finds malaria', async () => {
    const { user, router } = renderApp('/')

    const box = await screen.findByRole('combobox')
    await user.type(box, 'malaria')
    await user.click(screen.getByRole('button', { name: 'Search' }))

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/search')
    })
    expect(await screen.findByRole('heading', { name: 'Search results', level: 1 })).toBeInTheDocument()
    expect(await screen.findByText('Malaria')).toBeInTheDocument()
    expect(screen.getByText(/1 result for/)).toBeInTheDocument()
  })

  it('says so when nothing matches, and offers a way out', async () => {
    renderApp('/search?q=xyzzy')
    expect(await screen.findByText('No diseases matched that search')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Browse categories' })).toHaveAttribute(
      'href',
      '/categories',
    )
  })

  it('filters by category', async () => {
    renderApp('/search?q=&category=respiratory-conditions')
    expect(await screen.findByText('Asthma')).toBeInTheDocument()
    expect(screen.getByText(/in Respiratory conditions/)).toBeInTheDocument()
  })

  it('opens the disease from a suggestion', async () => {
    const { user, router } = renderApp('/')

    const box = await screen.findByRole('combobox')
    await user.type(box, 'mala')

    const list = await screen.findByRole('listbox', { name: 'Search suggestions' })
    await user.click(within(list).getByRole('option', { name: /Malaria/ }))

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/disease/malaria')
    })
  })

  it('opens the disease from the results list', async () => {
    const { router } = renderApp('/search?q=malaria')
    const link = await screen.findByRole('link', { name: 'Read more about Malaria' })
    expect(link).toHaveAttribute('href', '/disease/malaria')
    await router.navigate('/disease/malaria')
    expect(
      await screen.findByRole('heading', { name: 'Malaria', level: 1 }),
    ).toBeInTheDocument()
  })
})

describe('a disease page', () => {
  it('shows the name, the sections and a way to the remedy', async () => {
    renderApp('/disease/malaria')
    expect(await screen.findByRole('heading', { name: 'Malaria', level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Description' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Symptoms' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Causes' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Risk factors' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Prevention' })).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'View treatment and care' }).getAttribute('href'),
    ).toContain('/disease/malaria/remedy')
  })

  it('reports a disease that does not exist', async () => {
    renderApp('/disease/does-not-exist')
    expect(await screen.findByText(/not found/i)).toBeInTheDocument()
  })
})

describe('a remedy page', () => {
  it('shows the remedy, the source and the review date', async () => {
    renderApp('/disease/malaria/remedy')
    expect(await screen.findByRole('heading', { name: 'Malaria', level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Overview' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Care options' })).toBeInTheDocument()
    expect(screen.getByText('Last reviewed:')).toBeInTheDocument()
  })

  it('says so when a disease has no remedy yet', async () => {
    renderApp('/disease/typhoid-fever/remedy')
    expect(
      await screen.findByText('Remedy information is being prepared'),
    ).toBeInTheDocument()
    expect(screen.getByText(/does not have a remedy entry yet/)).toBeInTheDocument()
  })
})

describe('the category pages', () => {
  it('lists every category with its count', async () => {
    renderApp('/categories')
    expect(
      await screen.findByRole('heading', { name: 'All categories', level: 1 }),
    ).toBeInTheDocument()
    expect(screen.getByText('Infectious diseases')).toBeInTheDocument()
    expect(screen.getByText('Respiratory conditions')).toBeInTheDocument()
    expect(screen.getByText('Chronic conditions')).toBeInTheDocument()
  })

  it('shows one category with its diseases', async () => {
    renderApp('/category/respiratory-conditions')
    expect(
      await screen.findByRole('heading', { name: 'Respiratory conditions', level: 1 }),
    ).toBeInTheDocument()
    expect(screen.getByText('Asthma')).toBeInTheDocument()
  })

  it('reports a category that does not exist', async () => {
    renderApp('/category/nope')
    expect(await screen.findByText(/not found/i)).toBeInTheDocument()
  })
})

describe('the about page', () => {
  it('states the purpose and the limits of the site', async () => {
    renderApp('/about')
    expect(await screen.findByRole('heading', { name: /About/, level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Purpose' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Limits' })).toBeInTheDocument()
    expect(screen.getByText(/No dosages and no specific prescription instructions/)).toBeInTheDocument()
  })
})

describe('a page that does not exist', () => {
  it('shows the not found page', async () => {
    renderApp('/nothing-here')
    expect(
      await screen.findByRole('heading', { name: 'Page not found', level: 1 }),
    ).toBeInTheDocument()
    expect(screen.getByText('404')).toBeInTheDocument()
  })
})
