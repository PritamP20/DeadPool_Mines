import { Connection, Keypair, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { createTransferInstruction, getAssociatedTokenAddress, ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID, createAssociatedTokenAccountInstruction } from '@solana/spl-token';
import React from 'react';
import bs58 from "bs58";
import { useWallet } from '@solana/wallet-adapter-react';


const wallletFunction = ()=>{

    const wallet = useWallet()
    return wallet
}

export const sendDPC = async (e, wallet, amountUser) => {

    //user will send us

    console.log("sending")
    e.preventDefault()


    const connection = new Connection("https://api.devnet.solana.com");


    const localAccountPrivate = import.meta.env.VITE_PRIVATE_KEY
    const secretKey = bs58.decode(localAccountPrivate);
    const keypair = Keypair.fromSecretKey(new Uint8Array(secretKey));
    console.log("Public Key:", keypair.publicKey.toString());

    const mintAddress = new PublicKey("5PSM83h2i7mGt8TpB9nweKeVqpVuD28hKfPiXZXUYc9v");

    const accountInfo = async () => {
        const account = await connection.getParsedTokenAccountsByOwner(keypair.publicKey, {
            mint: mintAddress
        });
        console.log(account);
    };

    try {
        const senderAddress = new PublicKey(wallet.publicKey); // Assuming wallet is your Solana wallet instance
        const recipientAddress = new PublicKey("HBiVxoFJzbqQJBBsVSmop7b6LjF9J7hTncJvcE7vHrFb"); // Replace with actual recipient public key
        const amount = BigInt(amountUser* 10 ** 9); // Amount to transfer

        // Get associated token addresses for sender and recipient
        const senderTokenAddress = await getAssociatedTokenAddress(mintAddress, senderAddress, false, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);
        const recipientTokenAddress = await getAssociatedTokenAddress(mintAddress, recipientAddress, false, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);

        // Fetch account info to ensure the token accounts exist
        const senderTokenAccountInfo = await connection.getAccountInfo(senderTokenAddress);

        // If sender token account does not exist, create it
        if (!senderTokenAccountInfo) {
            const createTokenAccountTx = new Transaction().add(
                createAssociatedTokenAccountInstruction(
                    senderAddress, // Payer of the account creation
                    senderTokenAddress, // New token account address
                    senderAddress, // Owner of the new token account
                    mintAddress, // Token mint address
                    TOKEN_2022_PROGRAM_ID, // SPL Token 2022 program ID
                    ASSOCIATED_TOKEN_PROGRAM_ID // Associated Token Program ID
                )
            );

            const { blockhash } = await connection.getLatestBlockhash();
            createTokenAccountTx.recentBlockhash = blockhash;
            createTokenAccountTx.feePayer = senderAddress;

            const createTokenAccountSignature = await wallet.sendTransaction(createTokenAccountTx, connection);
            console.log("Token Account Created:", createTokenAccountSignature);
        }

        // Create transfer instruction
        const transferInstruction = createTransferInstruction(
            senderTokenAddress, // Source token account
            recipientTokenAddress, // Destination token account
            senderAddress, // Authority (in this case, sender)
            amount,
            [],
            TOKEN_2022_PROGRAM_ID // SPL Token 2022 program ID
        );

        // Create transaction and add the transfer instruction
        const transferTransaction = new Transaction().add(transferInstruction);

        const { blockhash } = await connection.getLatestBlockhash();
        transferTransaction.recentBlockhash = blockhash;
        transferTransaction.feePayer = senderAddress;

        // Sign and send the transaction
        const transferSignature = await wallet.sendTransaction(transferTransaction, connection);
        console.log("Tokens Transferred:", transferSignature);

    } catch (error) {
        console.error("Error sending tokens:", error);
    }
};


const Send = () => {
    
  return (
    <button onClick={e=>sendDPC(e)}>
      Send
    </button>
  )
}

export default Send
