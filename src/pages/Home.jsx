import Menu from "../Components/Menu"
import AuthComponent from './../Components/AuthComponent';

function Home() {
    return (
        <div>
            <Menu></Menu>
            <AuthComponent></AuthComponent>
            <p className='text-white'>Home Page</p>
        </div>
    )
}

export default Home
