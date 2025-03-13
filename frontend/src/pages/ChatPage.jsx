// import React, { useState } from "react";
// import { SideBar, ChatContainer } from "../componenets/index.js";
// import { useLocation } from "react-router-dom";

// function ChatPage() {
//     const location = useLocation();
//     const [selectedUser, setSelectedUser] = useState(location.state?.selectedUser || null);

//     const handleUserClick = (user) => {
//         setSelectedUser(user);
//     };

//     return (
//         <div className="flex h-screen bg-gray-100">
//             {/* Sidebar */}
//             <div className="w-1/4">
//                 <SideBar onUserClick={handleUserClick} />
//             </div>

//             {/* Chat Container */}
//             <div className="flex-1">
//                 {selectedUser ? (
//                     <ChatContainer user={selectedUser} />
//                 ) : (
//                     <div className="flex items-center justify-center h-full text-gray-500">
//                         Select a user to start chatting.
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }

// export default ChatPage;

import React, { useState } from "react";
import { SideBar, ChatContainer } from "../componenets/index.js";
import { useLocation } from "react-router-dom";

function ChatPage() {
    const location = useLocation();
    const [selectedUser, setSelectedUser] = useState(
        location.state?.selectedUser || null
    );

    const handleUserClick = (user) => {
        setSelectedUser(user);
    };

    return (
        <div className="flex flex-col md:flex-row h-screen">
            <div className="md:w-1/3 h-60 md:h-full border-b md:border-b-0 md:border-r">
                <SideBar onUserClick={handleUserClick} />
            </div>

            <div className="md:w-2/3 h-full">
                {selectedUser ? (
                    <ChatContainer user={selectedUser} />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        Select a user to start chatting.
                    </div>
                )}
            </div>
        </div>
    );
}

export default ChatPage;
