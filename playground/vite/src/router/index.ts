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
  {
    path: "/yes-no",
    component: () => import("../pages/PageYesNo.vue"),
    name: "YesNo",
    meta: {
      ai: {
        name: "YesNo",
        description:
          "This is a page to test and demostrate the YesNo function. The user can input a sentence and the ai will return a yes or no answer.",
      },
    },
  },
  {
    path: "/choice",
    component: () => import("../pages/PageChoice.vue"),
    name: "Choice",
    meta: {
      ai: {
        name: "Choice",
        description:
          "This is a page to test and demostrate the Choice function. The user can input a sentence and the ai will return a answer from the choices.",
      },
    },
  },
  {
    path: "/categorize",
    component: () => import("../pages/PageCategorize.vue"),
    name: "Categorize",
    meta: {
      ai: {
        name: "Categorize",
        description:
          "This is a page to test and demostrate the Categorize function.",
      },
    },
  },
  {
    path: "/chooseAndAnswer",
    component: () => import("../pages/PageChooseAndAnswer.vue"),
    name: "ChooseAndAnswer",
    meta: {
      ai: {
        name: "ChooseAndAnswer",
        description:
          "This is a page to test and demostrate the ChooseAndAnswer function.",
      },
    },
  },
  {
    path: "/embedding",
    component: () => import("../pages/PageEmbedding.vue"),
    name: "Embedding",
    meta: {
      ai: {
        name: "Embedding",
        description:
          "This page is for text embedding and visualization. The user can input a sentence and the system will visualize the embedding of the sentence.",
      },
    },
  },
]
const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
