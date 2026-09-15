import { mount } from '@vue/test-utils'
import HomePage from '@/views/HomePage.vue'
import { describe, expect, test, vi } from 'vitest'

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}))

describe('HomePage.vue', () => {
  test('renders the expense dashboard', () => {
    const wrapper = mount(HomePage)
    expect(wrapper.text()).toContain('Good evening')
    expect(wrapper.text()).toContain('Total transactions')
    expect(wrapper.text()).toContain('Recent expenses')
  })
})
