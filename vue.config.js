module.exports = {
  devServer: {
    proxy: {
      '/netease-api': {
        target: 'https://music-api.gdstudio.xyz',
        changeOrigin: true,
        pathRewrite: { '^/netease-api': '' }, 
      },
      '/kuwo-search-api': {
        target: 'https://search.kuwo.cn',
        changeOrigin: true,
        pathRewrite: { '^/kuwo-search-api': '' },
      },
      '/kuwo-mobi-api': {
        target: 'http://mobi.kuwo.cn', 
        changeOrigin: true,
        pathRewrite: { '^/kuwo-mobi-api': '' },
      },
    },
  },
};
