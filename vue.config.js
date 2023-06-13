// const {
//   defineConfig
// } = require('@vue/cli-service')
const port = process.env.port || process.env.npm_config_port || 80 // 端口
module.exports = {
  transpileDependencies: false,
  lintOnSave: false,
  devServer: {
    host: '0.0.0.0',
    // host: '192.168.1.5',
    // host: 'localhost',
    port: port,
    open: true,
    proxy: {
      // detail: https://cli.vuejs.org/config/#devserver-proxy
      [process.env.VUE_APP_BASE_API]: {
        // target: `http://localhost:8080`,
        // target: 'http://192.168.1.133:8080',
        // target:'http://192.168.1.232:8080',
        // target:'http://192.168.1.161:8080',
        // target:'http://192.168.1.139:8080',

        // target: 'http://192.168.1.198:8082', //测试环境
        target: 'http://47.108.149.12:8082',
        // target:'https://pro.scm.tysp.com/_javaMain',//生产环境
        changeOrigin: true,
        pathRewrite: {
          ['^' + process.env.VUE_APP_BASE_API]: ''
        }
      },
      [process.env.VUE_APP_BASE_API_PURCHASE]: {
        // target: 'http://192.168.1.198:8009', //测试环境
        target: 'http://47.108.149.12:8009',
        // target:'https://pro.scm.tysp.com',//生产环境
        changeOrigin: true,
        pathRewrite: {
          ['^' + process.env.VUE_APP_BASE_API_PURCHASE]: ''
        }
      },
      [process.env.VUE_APP_BASE_API_RICH_TEXT]: {
        // target: 'http://192.168.1.198:9205', //测试环境
        target: 'http://47.108.149.12:9205',
        // target:'https://pro.scm.tysp.com/_javaRichText',//生产环境
        changeOrigin: true,
        pathRewrite: {
          ['^' + process.env.VUE_APP_BASE_API_RICH_TEXT]: ''
        }
      }
    },
    // disableHostCheck: true
  },
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        }
      ]
    }
  }
}