import { Router, RouteLocationRaw } from "vue-router"

const waiter = {
  wait: Promise.resolve(),
}

export const useRouterPendingPush = (router: Router) => {
  return async (to: RouteLocationRaw) => {
    const result = await router.push(to)
    await waiter.wait

    return result
  }
}

export const useRouterWait = async () => {
  await waiter.wait
}

export const useRouterPending = () => {
  const controller = {
    release: () => {},
    pending: () => {},
  }

  controller.pending = () => {
    waiter.wait = new Promise((res) => {
      controller.release = res
    })
  }

  return controller
}
