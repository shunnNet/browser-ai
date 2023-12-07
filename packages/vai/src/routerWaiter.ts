import { Router, RouteLocationRaw } from "vue-router"

export type RouterWaiter = ReturnType<typeof createRouterWaiter>

export const createRouterWaiter = (router: Router) => {
  const _waiter = { wait: Promise.resolve() }

  const pendingPush = async (to: RouteLocationRaw) => {
    const failure = await router.push(to)
    if (!failure) {
      await _waiter.wait
    }

    return failure
  }

  const waitNavigation = () => _waiter.wait

  const pendingNavigation = () => {
    let release = () => {}
    _waiter.wait = new Promise((res) => (release = res))
    return release
  }

  return {
    pendingNavigation,
    waitNavigation,
    pendingPush,
  }
}
