import { dirname } from "pathe";
import { defineNuxtModule, logger } from "@nuxt/kit";
import { generate, loadCodegenConfig, loadContext } from "@graphql-codegen/cli";

interface ModuleOptions {
  devOnly: boolean;
  extensions: string[];
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "nuxt-graphql-codegen",
    configKey: "graphqlCodegen",
  },
  defaults: {
    devOnly: false,
    extensions: [".graphql", ".gql"]
  },
  async setup({ devOnly, extensions }, nuxt) {
    // Run in development mode only
    if (devOnly && !nuxt.options.dev) {
      return;
    }

    const context = await loadContext();

    // Execute GraphQL Code Generator
    async function codegen() {
      try {
        const start = Date.now();
        const config = context.getConfig();
        const cwd = process.cwd();

        await generate({ ...config, watch: false }, true);

        const time = Date.now() - start;
        logger.success(`GraphQL Code Generator generated code in ${time}ms`);
      } catch (e: unknown) {
        logger.error(`GraphQL Code Generator configuration not found.`);
      }
    }

    // Configure hooks
    nuxt.hook("build:before", codegen);
    nuxt.hook("builder:watch", async (_event, path) => {
      if (extensions.some((ext) => path.endsWith(ext))) {
        await codegen();
      }
    });
  },
});
