import React, { useEffect } from 'react'
import { useState } from 'react'
import CryptoJS from 'crypto-js'
import { useWallet } from '@solana/wallet-adapter-react'
import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js'
import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID, createTransferInstruction, getMetadataPointerState, getMint, getTokenMetadata } from '@solana/spl-token'
import gemSound from "../assets/gemSound.mp3"
import bombSound from "../assets/bombSound.mp3"
import Width from './Width'
import Send from './Send'
import { sendDPC } from './Send'
import { WidthDPC } from './Width'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Mine = () => {
    const {publicKey, connected} = useWallet()
    const wallet = useWallet()
    const connection = new Connection("https://api.devnet.solana.com")
    if(wallet!=null){
      getTokenAccounts(publicKey, connection)
    }
    if(publicKey!=null) console.log(publicKey.toString())
    const [fakeAccBalance, setFakeAccBalance] = useState(0)

    async function getTokenAccounts(wallet, solanaConnection) {
      const owner = new PublicKey(publicKey);
      const mintAddress = new PublicKey("5PSM83h2i7mGt8TpB9nweKeVqpVuD28hKfPiXZXUYc9v")
      let response = await connection.getParsedTokenAccountsByOwner(owner, {
        mint: mintAddress,
      });

      setFakeAccBalance(response.value[0].account.data.parsed.info.tokenAmount.amount/LAMPORTS_PER_SOL) 
      // const metadata = await getTokenMetadata(
      //   connection,
      //   mintAddress, 
      // );
      
      // const fetchURL = await fetch(metadata.uri);
      // const metadataJson = await fetchURL.json(); 
      
      // const imageUrl = metadataJson.image;
      // console.log(imageUrl)
  } 
  // getTokenAccounts(publicKey, connection) 

  // useEffect(()=>{
  //   console.log(bet)
  //   getTokenAccounts(publicKey, connection)
  // },[])

  const [bounce, setBounce] = useState(-1)

  const [seed, setSeed] = useState("3b9dfdb23a7eee96352e4cecbef60629 ")
  const [client, setcliendSeed] = useState("2zUQzdXcX7yb3AdwimiKiwTjXudSF9UFihFax95w7vbM")
  const [nonce, setNonce] = useState(0)
  const [mines, setMines] = useState([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,])
  const [noMine, setNoMines] = useState(1);
  const [Gems, setGems] = useState(24)
  const [successClicks, setSuccessClicks] = useState(0)
  const [amount, setAmount] = useState(0.0000)
  const [clicked, setClicked] = useState([])
  const [reward, setReward] = useState(amount)
  const [bet, setBet] = useState(0)
  const [showImage, setShowImage] = useState(Array(25).fill(false));
  const [Multiplier, setMultiplier] = useState(Math.pow(Gems / (Gems - noMine), successClicks));

  const gem = new Audio(gemSound)
  const bomb = new Audio(bombSound)
  bomb.playbackRate = 2;

  const notifySuccess = (message) => toast.success(message);
  const notifyError = (message) => toast.error(message);

  const generateMines=(seedgen)=>{
    const combinedSeed = `${seedgen}+${client}+${nonce}`
    const hashSeed = CryptoJS.SHA256(combinedSeed).toString()
    const randomPosition = [];
    let count = 0;
    let i = 1;
    while (randomPosition.length < noMine && count <= 50) {
      const position = parseInt(hashSeed.substring(i * 4, i * 4 + 4), 16) % (5 * 5);
      console.log(`Position: ${position}`);
      if (!randomPosition.includes(position)) {
        randomPosition.push(position); 
        
        setMines(prev => {
          const newMines = [...prev];
          newMines[position] = 0;
          return newMines;
        });
      }
      i++;
      count++;
    }
    if (count > 20) {
      console.log("Stopped due to reaching iteration limit.");
    }
  }
  const generateRandomSeed = ()=>{
    const seedgen = CryptoJS.lib.WordArray.random(128/8).toString();
    console.log("seedgen : ", seedgen)
    setSeed(seedgen)
    generateMines(seedgen)
  }

  const startBet = async(e) => {
    setShowImage(prev=>{
      const newPrev = [...prev]
      newPrev.map((item,index)=>{
        newPrev[index]=false;
      })
      return newPrev;
    })
    setClicked([])
    try {
      notifySuccess("Sent Money!....")
      await sendDPC(e, wallet, amount)
    } catch (error) {
      notifySuccess("Nigga!....")
      console.log(error)
    }
    // try { 
    //   await getTokenAccounts(publicKey, connection)
    // } catch (error) {
    //   notifyError("Sorry the balance wasn't fetched!")
    // }
    setMines([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,]);
    setGems(24)
    setMultiplier(0)
    setSuccessClicks(0)
    setReward(amount)
    setBet(true)
    e.preventDefault(); 
    generateRandomSeed(); 
  }

  const onCashOut = async (e) => {

    setClicked([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25])
    setTimeout(() => {
      setShowImage(Array(25).fill(true));
    }, 500);
    const rewardAmount = reward; 
    e.preventDefault();
    setReward(0);
    setBet(false);
    console.log("withdrawing");
    console.log("reward: ", rewardAmount);
    try {
      notifySuccess("Cashing out!....");
      await WidthDPC(e, wallet, rewardAmount);
      await getTokenAccounts(publicKey, connection);
    } catch (error) {
      notifyError("Failed to cash out.");
      console.error("Error during cash out:", error);
    }
  };

  const onClickBet = (e, index)=>{
    if(clicked.includes(index)) return
    e.preventDefault()
    setClicked(prev=>{
      const newClick = [...prev]
      newClick.push(index)
      return newClick
    })

    setTimeout(() => {
      setShowImage((prevShowImage) => {
        const newShowImage = [...prevShowImage];
        newShowImage[index] = true;
        return newShowImage;
      });
    }, 500);

    setBounce(index)
    if (mines[index] === 1) {
      setSuccessClicks((prevClicks) => {
          const newClicks = prevClicks + 1;  
  
          const newMultiplier = Math.pow(24 / (24 - noMine), newClicks);
          setMultiplier(newMultiplier);
  
          const newReward = (amount * newMultiplier).toFixed(9);
          setReward(newReward);
  
          console.log("reward: ", newReward, " amount: ", amount, " Multiplier: ", newMultiplier, "successClicks: ", newClicks);

          setTimeout(() => {
            setShowImage((prev) => {
              const newState = [...prev];
              newState[index] = true;
              return newState;
            });
            gem.play()
          }, 500);
  
          return newClicks;  
      });
  } else {
      getTokenAccounts(publicKey, connection)
      setMultiplier(0);
      setReward(0);
      setClicked([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25])
      setTimeout(() => {
        setShowImage(Array(25).fill(true));
        bomb.play()
      }, 500);
  }
  
    console.log(successClicks)
  }
    

  return (
    <>
    <div className='text-xl mt-16 font-bold text-white flex justify-center p-3'>
      <span 
        className='p-2 rounded-md flex items-center' 
        style={{ backgroundColor: "#0e212e", paddingInline: "1rem", textAlign: "center" }}
      >
        {fakeAccBalance!=0 ? fakeAccBalance : 0.0000}
        <img 
        className='flex-shrink-0 rounded-full' 
        style={{ marginLeft: "1rem", width:"35px", height: "35px" }} // Adjust width and height as needed
        src="https://silver-tricky-trout-945.mypinata.cloud/ipfs/bafkreic6a5uj7b7uscvlvuv4phzsfuf7vfg23du2atk4mhvibqafhg62t4" 
        alt=""
      />
      </span>
      
    </div>

    <div className='flex w-screen p-5 justify-center items-stretch bg-#1a2c38' style={{backgroundColor:"#1a2c38"}}>
      <div className=' md:grid md:grid-cols-12 lg:w-10/12 md:w-11/12 sm:w-8/12 gap-4 md:h-3/4 rounded-lg'>
        <div className='col-span-4 grid grid-cols-12 rounded-lg text-white' style={{backgroundColor:"#203642"}}>
          <div className='col-span-10 col-start-2 flex flex-col p-6'>
            <div >
              <div className='flex flex-col mb-4 gap-1'>
                <label htmlFor="bet" className='font-bold'> Bet Amount </label>
                <input onChange={e=>setAmount(e.target.value)} className='bg-slate-600 p-2  border placeholder:text-white font-bold'  type="number" placeholder='0.000000'/>
              </div>

              <div className='grid grid-cols-10 gap-3 mb-4 justify-between'>
                <div className='col-span-5 flex flex-col overflow-hidden gap-1'>
                  <label htmlFor="mines" className="placeholder:text-white font-bold">Mines</label>
                  <input
                    className='bg-slate-600 p-2 border placeholder:text-white'
                    onChange={e => setNoMines(e.target.value)}
                    min={1}
                    max={24}
                    type="number"
                    placeholder='1'
                  />
                </div>
                <div className='col-span-5 flex flex-col overflow-hidden gap-1 '>
                  <label htmlFor="gems" className='placeholder:text-white font-bold'>Gems</label>
                  <input
                    className='bg-slate-600 p-2 border placeholder:text-white'
                    type="number"
                    placeholder={`${25 - noMine}`}
                    readOnly
                  />
                </div>
              </div>


              <div className='flex flex-col mb-4 gap-1'>
                <div className='placeholder:text-white font-bold flex justify-between'>
                  <span>Total Profits: </span>
                  <span>x{Multiplier.toFixed(3)}</span>
                </div>
                <input className='bg-slate-600 p-2 border placeholder:text-white ' type="number" readOnly placeholder="0.0000" value={reward}/>
              </div>

              <div className="grid grid-flow-col justify-between">
                <button className='bg-blue-500 col-span-3 text-white px-4 py-2 rounded' onClick={(e) => startBet(e)}>
                  BET
                </button>
                <button className='bg-green-500 col-span-2  text-white px-4 py-2 rounded' disabled={reward==0 ? true: false} onClick={e=>onCashOut(e)}>Cashout</button>
              </div>
            </div>
          </div>
        </div>

        <div  className='col-span-8 grid grid-cols-12 justify-center rounded-lg md:p-5' style={{backgroundColor:"#0e212e"}}>
            <div className="col-span-12  lg:col-span-12 xl:col-span-10 xl:col-start-2 sm:col-span-12 md:col-span-12 grid grid-cols-5 grid-rows-5 lg:gap-3 md:gap-1 sm:gap-1 gap-2 p-4">
            {Array.from({ length: 25 }).map((_, index) => (
            <button
              key={index}
              disabled={bet==0 ? true : false}
              onClick={e => onClickBet(e, index)}
              style={{ backgroundColor: "#314654" }}
              className={`text-white rounded-lg h-16 lg:h-24 xl:h-28 xl:w-28 md:h-24 sm:h-20  shadow-2xl flex items-center justify-center transform transition-transform hover:scale-105 ${bounce === index ? 'animate-shake' : ''}`}
              
            >
              {clicked.includes(index) ? (
                showImage[index] ? (
                  mines[index] == 0 ? (
                    <img className="w-3/4" src="https://stake.com/_app/immutable/assets/mine.BrdEJX0T.svg" alt="" />
                  ) : (
                    <img className="w-3/4" src="https://stake.com/_app/immutable/assets/gem-none.Bcv6X_BH.svg" alt="" />
                  )
                ) : (
                  <div>&nbsp;</div> 
                )
              ) : (
                <div>&nbsp;</div> 
              )}
            </button>
          ))}
            </div>
        </div>
      </div>
    </div>

    <ToastContainer
        position="top-right"
        autoClose={5000} 
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
  </>


  )
}

export default Mine