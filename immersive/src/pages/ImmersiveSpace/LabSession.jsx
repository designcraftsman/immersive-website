import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import PdfViewer from "../../components/ImmersiveSpace/PDFViewer";
import VideoViewer from "../../components/ImmersiveSpace/VideoViewer";
import wallTexture from "../../assets/ImmersiveSpace/textures/blueWall2.jpg";
import floorTexture from "../../assets/ImmersiveSpace/textures/floor6.jpg";
import ceilingTexture from "../../assets/ImmersiveSpace/textures/ceilingLamps.jpg"
import teacherDesk from "../../assets/ImmersiveSpace/3D_Components/teacher_desk.glb";
import ProjectorScreen from "../../assets/ImmersiveSpace/3D_Components/projector_screen.glb"; 
import Projector from "../../assets/ImmersiveSpace/3D_Components/projector.glb"; 
import WindowBlind from "../../assets/ImmersiveSpace/3D_Components/window.glb";
import DeskEntity from '../../components/ImmersiveSpace/DeskEntity.jsx';
import deskShelf from "../../assets/ImmersiveSpace/3D_Components/ikea_fjallbo_wall_shelf.glb";
import arduinoProject1 from "../../assets/ImmersiveSpace/3D_Components/arduino_uno2.glb";
import motor1 from "../../assets/ImmersiveSpace/3D_Components/motor1.glb";
import SharedDesk from "../../components/ImmersiveSpace/SharedDesk.jsx";
import securityCamera from "../../assets/ImmersiveSpace/3D_Components/security_camera.glb";
import AC from "../../assets/ImmersiveSpace/3D_Components/conditioner_slide_dc.glb";
import ToOfferLights from "../../components/ImmersiveSpace/TofferLights";
import { useNavigate , useParams } from "react-router-dom";
import LoadingScreen from '../../components/ImmersiveSpace/LoadingScreen.jsx';
const Boy = process.env.PUBLIC_URL + '/assets/boy/scene.gltf';
const Girl = process.env.PUBLIC_URL + '/assets/girl/scene.gltf';




function LabSession(){
 const sceneRef = useRef(null);
 const cameraRef = useRef(null);
 const navigate = useNavigate();
 const [assets, setAssets] = useState([]);
 const [course, setCourse] = useState(null);
 const { sessionName,idCourse, username } = useParams();
 const [loading, setLoading] = useState(true); // Loading state
 const [messages, setMessages] = useState([]);
 const [newMessage, setNewMessage] = useState('');
 const socketRef = useRef();
 const messageEndRef = useRef(null);
 const [users, setUsers] = useState([]);
 const [gender , setGender] = useState(null);

 
  
  useEffect(() => {
    if (sceneRef.current) {
      const interval = setInterval(() => {
        const camera = sceneRef.current.querySelector('#camera');
        if (camera) {
          const position = camera.getAttribute('position');
          let rotation = camera.getAttribute('rotation');
  
          const distanceInFront = 1;
          const radianY = (rotation.y * Math.PI) / 180;
  
          const adjustedPosition = {
            x: position.x + Math.sin(radianY) * distanceInFront,
            y: position.y,
            z: position.z + Math.cos(radianY) * distanceInFront,
          };
  
          const adjustedRotation = {
            x: (rotation.x + 10) % 360,
            y: (rotation.y + 180) % 360,
            z: rotation.z,
          };

          const animation = position.x !== adjustedPosition.x || position.z !== adjustedPosition.z ? 'walk' : 'idle';
  
          socketRef.current.emit('updatePosition', {
            position: adjustedPosition,
            rotation: adjustedRotation,
            animation,
          });
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, [username,course]);
  
  const handleSendMessage = () => {
    if (newMessage.trim() !== '') {
      socketRef.current.emit('chatMessage', newMessage);
      setNewMessage('');
    }
  };

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

 
  

 const getCourse = async () => {
  try {
    const response = await fetch(`http://localhost:4200/courses/get/course/${idCourse}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch course');
    }
    const jsonData = await response.json();
    setCourse(jsonData.course);
    setGender(jsonData.course.gender);
    console.log(jsonData.course);
  } catch (error) {
    console.error('Error:', error);
  }
};


    const getAssets = async () => {
     
      try {
        const response = await fetch(`http://localhost:4200/assets/get/course/${idCourse}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
    
        if (!response.ok) {
          throw new Error('Failed to save model data');
        }
    
        const jsonData = await response.json();
        setAssets(jsonData.assets);
      } catch (error) {
        console.error('Error:', error);
      }
    };
    useEffect(() => {
        const fetchData = async () => {
          await getAssets();
          await getCourse();
    
          // Delay before setting loading to false
          setTimeout(() => {
            setLoading(false);
          }, 5000); 
        };
    
        fetchData();
      }, [idCourse]);

      useEffect(() => {
        socketRef.current = io('http://localhost:4200');
    
        socketRef.current.emit('joinRoom', { username, room: sessionName , gender: gender });
    
        socketRef.current.on('message', (message) => {
          setMessages((prevMessages) => [...prevMessages, message]);
        });
        
        socketRef.current.on('userLeave', (id) => {
          setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
        });
  
        socketRef.current.on('updateUserPosition', ({ id, username, position, rotation }) => {
          setUsers((prevUsers) => {
            const userExists = prevUsers.find((user) => user.id === id);
            if (userExists) {
              const isMoving = userExists.position.x !== position.x || userExists.position.z !== position.z;
              return prevUsers.map((user) =>
                user.id === id
                  ? { ...user, position, rotation, isMoving }
                  : user
              );
            } else {
              return [...prevUsers, { id, username, position, rotation, isMoving: false }];
            }
          });
        });
  
        return () => {
          if (socketRef.current) {
            socketRef.current.disconnect();
          }
        };
    }, [sessionName, username]);

    if (loading) {
      return (
      <LoadingScreen />
      )
    }
    
  return(
      <div className='App'>
          <a-scene ref={sceneRef} loading-screen="enabled:false;"  >
              <a-assets>
                  {assets.map((asset) => (
                      <a-asset-item key={asset.idAsset} id={asset.idAsset} src={asset.url}></a-asset-item>
                  ))}
                  <img id="wallTexture" src={wallTexture} alt="name"/>
                  <img id="floorTexture" src={floorTexture}  alt="name"/>
                  <img id="ceilingTexture" src={ceilingTexture} alt="name" />
                  <a-asset-item id="video" src={course?.video || ''}></a-asset-item>
                  <a-asset-item id="pdf" src={course?.coursepdf || ''}></a-asset-item>
              </a-assets>


              
              {assets.map((asset, index) => (
                  <a-gltf-model
                    name={asset.idAsset}
                    key={asset.idAsset}
                    class="selectable uploadedAssets"
                    src={asset.url}
                    position={`${asset.properties.position.x} ${asset.properties.position.y} ${asset.properties.position.z}`}
                    scale={`${asset.properties.scale.x} ${asset.properties.scale.y} ${asset.properties.scale.z}`}
                    rotation={`${asset.properties.rotation.x} ${asset.properties.rotation.y} ${asset.properties.rotation.z}`}
                  ></a-gltf-model>
              ))}
        
              
                {users.map((user) => (
                    <a-entity
                    key={user.id}
                    position={`${user.position.x} 0 ${user.position.z}`}
                    rotation={`${user.rotation.x} ${user.rotation.y} ${user.rotation.z}`}
                    >
                    {user.gender === 'men' && (
                    <a-gltf-model
                        src={Boy}
                        scale="1 1 1"
                        {...(user.isMoving && { 'animation-mixer': '' })} // Conditionally add animation-mixer if user is moving
                    ></a-gltf-model>
                    )}
                    {user.gender === 'women' && (
                    <a-gltf-model
                        src={Girl}
                        scale="1 1 1"
                        {...(user.isMoving && { 'animation-mixer': '' })} // Conditionally add animation-mixer if user is moving
                    ></a-gltf-model>
                    )}
                    {/* Username centered above the avatar */}
                    <a-text 
                        value={user.username} 
                        position="0 13 0"  // Adjust the Y position to move it slightly above the avatar
                        align="center"      // Center align the text horizontally
                        color="black"        // White text color
                        width="4"           // Adjust the width to match the text
                    ></a-text>
                    </a-entity>
                ))}
                  <VideoViewer 
                  scale="5 5 5"
                  position="39 11 -17"
                  rotation="0 -90 0"
                  />
              
                  <PdfViewer 
                  pdf={course?.coursepdf || ''}
                  scale={2.5}
                  rotation="0 -90 0"
                  position="32 5 20" />
              

                  <ToOfferLights />
              {/* Floor */}
              <a-plane 
                  rotation="-90 0 0" 
                  width="80" // Doubled the width
                  height="80" // Doubled the height
                  material={`src: url(${floorTexture}); repeat: 4 5`}  
                  class="collidable"
              />
              {/* Teacher Desk */}
              <a-gltf-model 
                   src={teacherDesk} 
                   position="-30 1.9 0" 
                   scale=".09 .09 .09"
                   rotation="0 180 0"
                  class="collidable"
              ></a-gltf-model>
               {/* Walls */}
              <a-box 
                  position="0 10 -40" 
                  rotation="0 0 0" 
                  width="80" 
                  height="20" 
                  depth="0.1" 
                  material={`src: url(${wallTexture}); repeat: 4 2`}  
                  src={wallTexture}
                  class="collidable "

              />

              <a-box 
                  position="40 10 0" 
                  rotation="0 -90 0" 
                  width="80" 
                  height="20" 
                  depth="0.1" 
                  material={`src: url(${wallTexture}); repeat: 4 2`}  
                  src={wallTexture}
                  repeat="4 2"
                  class="collidable "
              />

              <a-box 
                  position="-40 10 0" 
                  rotation="0 90 0" 
                  width="80" 
                  height="20" 
                  depth="0.1" 
                  material={`src: url(${wallTexture}); repeat: 4 2`}  
                  src={wallTexture}
                  class="collidable "
              />

              <a-box 
                  position="0 10 40" 
                  rotation="0 180 0" 
                  width="80" 
                  height="20" 
                  depth="0.1" 
                  material={`src: url(${wallTexture});repeat: 4 2`}  
                  src={wallTexture}
                  class="collidable "
              />

              {/* Ceiling */}
              <a-plane 
                  position="0 20 0" 
                  rotation="90 0 0" 
                  width="80" 
                  height="80" 
                  material={`src: url(${ceilingTexture}); repeat: 2 3`}  
                  src={ceilingTexture}
                  class="collidable"
              />

              {/* Projector screen */}
              <a-gltf-model 
                  src={ProjectorScreen} 
                  position="79 30 -17" 
                  scale="4 10 6"
                  rotation="0 0 0"
              ></a-gltf-model>
              {/*The video is projected in the projetor screen */}


              {/* Projector  */}
              <a-gltf-model 
                  src={Projector} 
                  position="50 33 -17" 
                  scale="10 10 10"
                  rotation="0 90 0"
              ></a-gltf-model>

              <a-entity>
                  <a-gltf-model 
                      src={WindowBlind} 
                      position="-18 8 39.5" 
                      scale="2 2 2"
                      rotation="0 0 0"
                  ></a-gltf-model>
                  <a-gltf-model 
                      src={WindowBlind} 
                      position="0 8 39.5" 
                      scale="2 2 2"
                      rotation="0 0 0"
                  ></a-gltf-model>
                  <a-gltf-model 
                      src={WindowBlind} 
                      position="18 8 39.5" 
                      scale="2 2 2"
                      rotation="0 0 0"
                  ></a-gltf-model>
              </a-entity>

              <a-entity>
                  <a-gltf-model 
                      src={WindowBlind} 
                      position="-18 8 -39.5" 
                      scale="2 2 2"
                      rotation="0 180 0"
                  ></a-gltf-model>
                  <a-gltf-model 
                      src={WindowBlind} 
                      position="0 8 -39.5" 
                      scale="2 2 2"
                      rotation="0 180 0"
                  ></a-gltf-model>
                  <a-gltf-model 
                      src={WindowBlind} 
                      position="18 8 -39.5" 
                      scale="2 2 2"
                      rotation="0 180 0"
                  ></a-gltf-model>
              </a-entity>


              {/* Desks with chairs with lights and pcs */}
              <DeskEntity position="-24 0 -36" rotation="0 0 0"/>
              <DeskEntity position="-12 0 -36" rotation="0 0 0"/>
              <DeskEntity position="0 0 -36"rotation="0 0 0" />
              <DeskEntity position="12 0 -36" rotation="0 0 0"/>
              <DeskEntity position="24 0 -36" rotation="0 0 0"/>


              <DeskEntity position="-24 0 36" rotation="0 180 0"/>
              <DeskEntity position="-12 0 36" rotation="0 180 0"/>
              <DeskEntity position="0 0 36" rotation="0 180 0"/>
              <DeskEntity position="12 0 36" rotation="0 180 0"/>
              <DeskEntity position="24 0 36" rotation="0 180 0"/>



              <SharedDesk position='0 0 0' rotation='0 0 0'/>
              <SharedDesk position='0 0 -20' rotation='0 0 0'/>
     
              <a-entity>
                  <a-gltf-model 
                      src={deskShelf} 
                      position="34.5 5 -38.7" 
                      scale="13 13 8"
                      rotation="0 -90 0"
                      class="collidable"
                  ></a-gltf-model>
                  <a-gltf-model 
                      src={arduinoProject1} 
                      position="33 6.9 -38" 
                      scale=".5 .5 .5"
                      rotation="0 0 0"
                      class="collidable"
                      grabbable
                  ></a-gltf-model>
                  <a-gltf-model 
                      src={deskShelf} 
                      position="34.5 8 -38.7" 
                      scale="13 13 8"
                      rotation="0 -90 0"
                      class="collidable"
                  ></a-gltf-model>
                  <a-gltf-model 
                      src={motor1} 
                      position="35 9.4 -38.5" 
                      scale="6 6 6"
                      rotation="0 90 0"
                      class="collidable"
                  ></a-gltf-model>
              </a-entity>
              
                <a-gltf-model  
                    src={securityCamera}
                    position="-39 20 -39"
                    scale=".5 .5 .5"
                    rotation="180 -120 0"
                ></a-gltf-model>
                <a-gltf-model  
                    src={securityCamera}
                    position="39 20 39"
                    scale=".5 .5 .5"
                    rotation="180 50 0"
                ></a-gltf-model>


            <a-gltf-model 
                src={ProjectorScreen} 
                position="39.4 15 -17" 
                scale="2 4 4"
                rotation="0 0 0"
                class="collidable"
            ></a-gltf-model>

            <a-gltf-model 
                src={Projector} 
                position="30 18 -17" 
                scale="5 5 5"
                rotation="0 90 0"
                
            ></a-gltf-model>

              <a-gltf-model  
                  src={AC}
                  position="39 18 5"
                  rotation="0 -90 0"
                  scale="13 9 4"
              ></a-gltf-model>
              <a-gltf-model  
                  src={AC}
                  position="-39 18 0"
                  rotation="0 90 0"
                  scale="13 9 4"
              ></a-gltf-model>  

              <a-entity
                  id="camera"
                  camera
                  look-controls
                  my-custom-look-controls
                  camera-collider="speed: 1; radius: 0.5"
                  ref={cameraRef}
                  rotation="0 0 0"
                  position="10 12 0"
                  >
                  <a-cursor></a-cursor>
              </a-entity>

          </a-scene>
          <div
        className="chat-box position-fixed bottom-0 start-0 p-3 m-3 shadow-lg"
        style={{
          width: '500px',
          maxHeight: '300px',
          overflowY: 'auto',
          backgroundColor: 'rgba(0, 0, 0, 0.20)',
          borderRadius: '8px',
        }}
      >
        <div className="messages opacity-100">
          {messages.map((msg, index) => (
            <div key={index} className="message bg-transparent text-white p-0 mb-0 rounded m-0 p-0">
              <p className="text-start mb-2">
                <span className="fw-bold text-info">{msg.username}:</span> {msg.text} <br />
                <span className="text-muted" style={{ fontSize: '0.8rem' }}>{msg.time}</span>
              </p>
            </div>
          ))}
          <div ref={messageEndRef} />
        </div>

        <div className="input-group mt-2">
          <input
            type="text"
            className="form-control"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleSendMessage}>
            Send
          </button>
        </div>
      </div>
      </div>

  );
}
export default LabSession;