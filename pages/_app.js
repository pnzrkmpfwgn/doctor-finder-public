/* eslint-disable */
import Layout from "../components/layout/layout";
import { CookiesProvider } from "react-cookie";
import '../styles/globals.css';
import Head from "next/head";
import Script from 'next/script';


//Redux boilerplate
import { Provider } from "react-redux";
import store from '../redux/store';


const App = ({Component, pageProps, router}) =>{
  return (
    <>
    <Head>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    </Head>
    <Script src='https://cdn.jsdelivr.net/npm/fullcalendar/index.global.min.js'></Script>
      <Provider store={store} >
      <CookiesProvider>
        <Layout>
              <Component {...pageProps} key={router.route} />
        </Layout>
      </CookiesProvider>
      </Provider>
    </>
  );
}

export default App;