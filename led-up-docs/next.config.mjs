import nextra from 'nextra';

const nextConfig = {
  reactStrictMode: true,
};

const withNextra = nextra({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
});

export default withNextra(nextConfig);
