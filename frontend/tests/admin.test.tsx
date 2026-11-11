/**
 * The admin area checks.
 *
 * These are the same checks the old `scripts/adminCheck.tsx` script made,
 * now written with Testing Library so that they read like the user story
 * instead of a pile of DOM queries.
 *
 * The real routes, the real services and the real sample data are used.
 */
import { describe, expect, it } from 'vitest'
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react'
import { renderApp, signIn, type TestRouter } from './helpers'

/** Opens another address in the router the test is using. */
async function go(router: TestRouter, path: string) {
  await act(async () => {
    await router.navigate(path)
  })
}

/**
 * Puts a value into a field.
 *
 * The text is set in one go rather than typed letter by letter, because the
 * form checks every rule on every keystroke and a full pass over the form
 * would take seconds per field.
 */
function fill(element: HTMLElement, value: string) {
  fireEvent.change(element, { target: { value } })
}

/** Fills in the disease form on the current page. */
async function fillDiseaseForm(
  values: {
    name: string
    summary: string
    description: string
    category?: string
  },
) {
  fill(await screen.findByLabelText(/^Name/), values.name)
  fill(screen.getByLabelText(/^Short summary/), values.summary)
  fill(screen.getByLabelText(/^Description/), values.description)
  fill(screen.getByLabelText(/^Category/), values.category ?? 'infectious-diseases')

  fill(screen.getByPlaceholderText('For example: Fever'), 'Watery diarrhoea')
  fill(
    screen.getByPlaceholderText('For example: A mosquito bite'),
    'Drinking water contaminated with faeces',
  )
  fill(
    screen.getByPlaceholderText('For example: Living in a warm, wet area'),
    'Unsafe drinking water',
  )
  fill(
    screen.getByPlaceholderText('For example: Use a mosquito net at night'),
    'Drink safe treated water',
  )
}

describe('the admin guard', () => {
  it('shows the login page when signed out', async () => {
    renderApp('/admin')
    expect(
      await screen.findByRole('heading', { name: 'Admin sign in', level: 1 }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
  })

  it('refuses a wrong password without saying what was wrong', async () => {
    const { user } = renderApp('/admin/login')
    await user.type(screen.getByLabelText('Email address'), 'admin@diseasewise.test')
    await user.type(screen.getByLabelText('Password'), 'not-the-password')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    const alert = await screen.findByRole('alert')
    expect(alert.textContent?.toLowerCase()).not.toContain('password')
  })

  it('opens the dashboard after signing in', async () => {
    const { user } = renderApp('/admin')
    // The guard sends the visitor to the login page first, so the form is
    // looked for rather than assumed.
    await user.type(
      await screen.findByLabelText('Email address'),
      'admin@diseasewise.test',
    )
    await user.type(screen.getByLabelText('Password'), 'diseasewise')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(
      await screen.findByRole('heading', { name: 'Dashboard', level: 1 }),
    ).toBeInTheDocument()
    expect(screen.getByText('Recently updated')).toBeInTheDocument()
    expect(screen.getByText('Needs attention')).toBeInTheDocument()
  })
})

describe('the admin pages', () => {
  it('opens the disease list', async () => {
    await signIn()
    renderApp('/admin/diseases')
    expect(
      await screen.findByRole('heading', { name: 'Diseases', level: 1 }),
    ).toBeInTheDocument()
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByText('Malaria')).toBeInTheDocument()
    expect(screen.getByRole('searchbox')).toBeInTheDocument()
  })

  it('opens the add disease form', async () => {
    await signIn()
    renderApp('/admin/diseases/new')
    expect(
      await screen.findByRole('heading', { name: 'Add a disease', level: 1 }),
    ).toBeInTheDocument()
    expect(await screen.findByLabelText(/^Name/)).toBeInTheDocument()
    expect(screen.getByText(/\/disease\//)).toBeInTheDocument()
    expect(screen.getByText('Symptoms')).toBeInTheDocument()
  })

  it('opens the edit disease form, filled in', async () => {
    await signIn()
    renderApp('/admin/diseases/1/edit')
    expect(
      await screen.findByRole('heading', { name: 'Edit Malaria', level: 1 }),
    ).toBeInTheDocument()
    expect(await screen.findByLabelText(/^Name/)).toHaveValue('Malaria')
  })

  it('opens the remedy list and marks the missing remedy', async () => {
    await signIn()
    renderApp('/admin/remedies')
    expect(
      await screen.findByRole('heading', { name: 'Remedies', level: 1 }),
    ).toBeInTheDocument()
    expect(screen.getByText('Not written yet')).toBeInTheDocument()
  })

  it('asks which disease a remedy is for', async () => {
    await signIn()
    renderApp('/admin/remedies/new')
    expect(await screen.findByText('Which disease is this for?')).toBeInTheDocument()
  })

  it('warns about dosages and asks for a source', async () => {
    await signIn()
    renderApp('/admin/remedies/new?disease=2')
    expect(await screen.findByText('Remedy for Typhoid fever')).toBeInTheDocument()
    expect(screen.getByText(/Do not write dosages/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Source or reviewer/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Last reviewed/)).toBeInTheDocument()
  })

  it('opens the category page', async () => {
    await signIn()
    renderApp('/admin/categories')
    expect(
      await screen.findByRole('heading', { name: 'Categories', level: 1 }),
    ).toBeInTheDocument()
    expect(
      await screen.findByRole('region', { name: 'Add a category' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Infectious diseases')).toBeInTheDocument()
  })
})

describe('adding a disease through the form', () => {
  it('saves the disease, flags it as featured and puts it on the home page', async () => {
    await signIn()
    const { user, router } = renderApp('/admin/diseases/new')

    await fillDiseaseForm({
      name: 'Cholera',
      summary: 'A waterborne infection that causes severe watery diarrhoea.',
      description: 'Cholera spreads through water contaminated by faeces.',
    })

    await user.click(screen.getByLabelText('Show on the home page'))
    expect(screen.getByLabelText('Show on the home page')).toBeChecked()
    expect(screen.getByText(/unsaved changes/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Add disease' }))

    expect(await screen.findByText(/Added Cholera/)).toBeInTheDocument()
    expect(
      await screen.findByRole('heading', { name: 'Edit Cholera', level: 1 }),
    ).toBeInTheDocument()

    await go(router, '/admin/diseases')
    const row = (await screen.findByText('Cholera')).closest('tr')
    expect(row?.textContent).toContain('Featured')

    await go(router, '/')
    expect(await screen.findByText('Cholera')).toBeInTheDocument()
  })
})

describe('deleting a disease through the list', () => {
  it('asks first, then removes the disease', async () => {
    await signIn()
    const { user, router } = renderApp('/admin/diseases/new')

    await fillDiseaseForm({
      name: 'Cholera',
      summary: 'A waterborne infection that causes severe watery diarrhoea.',
      description: 'Cholera spreads through water contaminated by faeces.',
    })
    await user.click(screen.getByRole('button', { name: 'Add disease' }))
    await screen.findByRole('heading', { name: 'Edit Cholera', level: 1 })

    await go(router, '/admin/diseases')
    await user.click(await screen.findByRole('button', { name: 'Delete Cholera' }))

    const dialog = await screen.findByRole('alertdialog')
    expect(dialog).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: 'Delete disease' }))

    expect(await screen.findByText(/Deleted Cholera/)).toBeInTheDocument()
    await waitFor(() => {
      const rows = screen.queryAllByRole('row')
      expect(rows.some((row) => row.textContent?.includes('Cholera'))).toBe(false)
    })
  })
})

describe('adding and renaming a category', () => {
  it('adds a category and renames it in place', async () => {
    await signIn()
    const { user } = renderApp('/admin/categories')

    const addSection = await screen.findByRole('region', { name: 'Add a category' })
    fill(within(addSection).getByPlaceholderText('Skin conditions'), 'Skin conditions')
    await user.click(within(addSection).getByRole('button', { name: 'Add category' }))

    expect(await screen.findByText(/Added Skin conditions/)).toBeInTheDocument()

    await user.click(
      await screen.findByRole('button', { name: 'Rename Skin conditions' }),
    )
    const saveButton = await screen.findByRole('button', { name: 'Save name' })
    expect(saveButton).toBeInTheDocument()

    const row = saveButton.closest('li') as HTMLElement
    const nameField = within(row).getByLabelText(/^Name/)
    fill(nameField, 'Skin and hair conditions')
    await user.click(within(row).getByRole('button', { name: 'Save name' }))

    expect(await screen.findByText(/Saved Skin and hair conditions/)).toBeInTheDocument()
  })

  it('will not delete a category that still holds diseases', async () => {
    await signIn()
    const { user } = renderApp('/admin/categories')

    await user.click(
      await screen.findByRole('button', { name: 'Delete Infectious diseases' }),
    )

    const dialog = await screen.findByRole('alertdialog')
    expect(dialog.textContent).toContain('still holds')
    expect(within(dialog).getByRole('button', { name: 'Delete category' })).toBeDisabled()

    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    })
  })
})

describe('awkward content', () => {
  const awkward = [
    {
      label: 'a very long name',
      name: 'Very long condition name that keeps going and going to make sure the layout still holds together properly',
    },
    { label: 'accented characters', name: 'Fièvre jaune et Installer rules' },
    {
      label: 'symbols',
      name: 'Cost < 50% & > 1/2 — “quoted” (parentheses) [brackets]',
    },
  ]

  it.each(awkward)('saves and shows $label', async ({ name }) => {
    await signIn()
    const { user, router } = renderApp('/admin/diseases/new')

    await fillDiseaseForm({
      name,
      summary: 'A short summary that runs past the edge of a narrow column.',
      description: 'A longer description of the same condition, repeated for length.',
    })
    await user.click(screen.getByRole('button', { name: 'Add disease' }))

    expect(await screen.findByText(/^Added /)).toBeInTheDocument()

    await go(router, '/admin/diseases')
    expect(await screen.findByText(name)).toBeInTheDocument()
  })

  it('keeps a scroll area on the table for narrow screens', async () => {
    await signIn()
    const { container } = renderApp('/admin/diseases')
    await screen.findByRole('table')
    expect(container.querySelector('.overflow-x-auto')).not.toBeNull()
  })
})

describe('the public site still works', () => {
  it('opens the home page, the about page and a category page', async () => {
    const { router } = renderApp('/')

    expect(
      await screen.findByRole('heading', {
        name: 'Clear health information in one place',
        level: 1,
      }),
    ).toBeInTheDocument()

    await go(router, '/about')
    expect(
      await screen.findByRole('heading', { name: /About/, level: 1 }),
    ).toBeInTheDocument()

    await go(router, '/category/respiratory-conditions')
    expect(await screen.findByText('Asthma')).toBeInTheDocument()
  })
})
