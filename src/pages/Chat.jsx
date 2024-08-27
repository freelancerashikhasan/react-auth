import { useParams } from "react-router-dom"
import Menu from "../Components/Menu"

function Chat() {
    let {userId} = useParams();
    return (
        <div>
            <Menu></Menu>
            <p className='text-white'>Chat Page {userId}</p>
        </div>
    )
}

export default Chat
