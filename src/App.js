import "./App.css";
import Chat from "./components/Chat";
import Sidebar from "./components/Sidebar";
import React, { useEffect, useState } from "react";
import Pusher from "pusher-js";
import axios from "./components/axios";

function App() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    axios.get("/messages/sync").then((response) => {
      setMessages(response.data);
    });
  }, []);
  useEffect(() => {
    const pusher = new Pusher("5061c6233fc0eec6ea5b", {
      cluster: "eu",
    });

    const channel = pusher.subscribe("message");
    channel.bind("inserted", (newMessage) => {
      // alert(JSON.stringify(newMessage));
      setMessages([...messages, newMessage]);
    });
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [messages]);
  console.log(messages);
  return (
    <div className="app">
      <div className="app__body">
        {/* sidebar */}
        <Sidebar />

        {/* chat component */}
        <Chat messages={messages} />
      </div>
    </div>
  );
}

export default App;
