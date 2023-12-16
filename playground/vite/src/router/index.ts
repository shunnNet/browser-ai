import { createRouter, createWebHistory } from "vue-router"

const routes = [
  {
    path: "/",
    component: () => import("../pages/PageIndex.vue"),
    name: "Index",
    meta: {
      ai: {
        name: "Index",
        description:
          "This is the index page. Include the chatbot interface which is the main function of this website. The chatbot interface is at the top of the page.",
      },
    },
  },
]
const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
