import { defineNuxtModule, logger } from '@nuxt/kit';
import { loadContext, generate } from '@graphql-codegen/cli';

const module = defineNuxtModule({
  meta: {
    name: "nuxt-graphql-codegen",
    configKey: "graphqlCodegen"
  },
  defaults: {
    devOnly: false,
    extensions: [".graphql", ".gql"]
  },
  async setup({ devOnly, extensions }, nuxt) {
    if (devOnly && !nuxt.options.dev) {
      return;
    }
    const context = await loadContext();
    async function codegen() {
      try {
        const start = Date.now();
        const config = context.getConfig();
        const cwd = process.cwd();
        await generate({ ...config, watch: false }, true);
        const time = Date.now() - start;
        logger.success(`GraphQL Code Generator generated code in ${time}ms`);
      } catch (e) {
        logger.error(`GraphQL Code Generator configuration not found.`);
      }
    }
    nuxt.hook("build:before", codegen);
    nuxt.hook("builder:watch", async (_event, path) => {
      if (extensions.some((ext) => path.endsWith(ext))) {
        await codegen();
      }
    });
  }
});

export { module as default };
