import '../styles.css';
import {ProjectProvider} from '../components/ProjectProvider';
import Layout from '../components/Layout';
export default function App({Component,pageProps}){return <ProjectProvider><Layout><Component {...pageProps}/></Layout></ProjectProvider>}
