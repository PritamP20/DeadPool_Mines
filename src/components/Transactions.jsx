import { Connection, Keypair, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { createTransferInstruction, getAssociatedTokenAddress, ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID, createAssociatedTokenAccountInstruction } from '@solana/spl-token';
import React from 'react';
import bs58 from "bs58";
import { useWallet } from '@solana/wallet-adapter-react';

const Transactions = () => {
    const connection = new Connection("https://api.devnet.solana.com");
    const wallet = useWallet()

    const localAccountPrivate = import.meta.env.VITE_PRIVATE_KEY;
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

    const widthdrawDPC = async () => {
        try {
            const recipientPublicKey = new PublicKey("77VsMw1E7sdxuwHAjdjsyeUhJXXFFvVax1FNj7KqGGXR"); // Replace with actual recipient public key
            const amount = BigInt(100 * 10 ** 9); // Amount to transfer

            // Get associated token addresses for sender and recipient
            const senderTokenAddress = await getAssociatedTokenAddress(mintAddress, keypair.publicKey, false, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);
            const recipientTokenAddress = await getAssociatedTokenAddress(mintAddress, recipientPublicKey, false, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);

            // Fetch account info to ensure the token accounts exist
            const senderTokenAccountInfo = await connection.getAccountInfo(senderTokenAddress);
            const recipientTokenAccountInfo = await connection.getAccountInfo(recipientTokenAddress);

            // Check if the recipient token account exists, if not, create it
            if (!recipientTokenAccountInfo) {
                const transaction = new Transaction().add(
                    createAssociatedTokenAccountInstruction(
                        keypair.publicKey, // Payer of the account creation
                        recipientTokenAddress, // New recipient token account
                        recipientPublicKey, // Owner of the new token account
                        mintAddress, // Token mint address
                        TOKEN_2022_PROGRAM_ID // Use SPL Token 2022 program
                    )
                );

                const { blockhash } = await connection.getLatestBlockhash();
                transaction.recentBlockhash = blockhash;
                transaction.feePayer = keypair.publicKey;

                await sendAndConfirmTransaction(
                    connection,
                    transaction,
                    [keypair]
                );
                console.log("Recipient Token Account Created");
            }

            // Create transfer instruction
            const transferInstruction = createTransferInstruction(
                senderTokenAddress, // Source token account
                recipientTokenAddress, // Destination token account
                keypair.publicKey, // Authority
                amount,
                [],
                TOKEN_2022_PROGRAM_ID // SPL Token 2022 program ID
            );

            // Create transaction and add the transfer instruction
            const transferTransaction = new Transaction().add(transferInstruction);

            const { blockhash } = await connection.getLatestBlockhash();
            transferTransaction.recentBlockhash = blockhash;
            transferTransaction.feePayer = keypair.publicKey;

            const signature = await sendAndConfirmTransaction(
                connection,
                transferTransaction,
                [keypair]
            );

            console.log("Tokens Transferred:", signature);

        } catch (error) {
            console.error("Error sending tokens:", error);
        }
    };

    const sendDPC = async () => {
        try {
            const senderAddress = new PublicKey(wallet.publicKey); // Assuming wallet is your Solana wallet instance
            const recipientAddress = new PublicKey("2zUQzdXcX7yb3AdwimiKiwTjXudSF9UFihFax95w7vbM"); // Replace with actual recipient public key
            const amount = BigInt(100 * 10 ** 9); // Amount to transfer
    
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
    // sendDPC();
    widthdrawDPC()


    return (
        <div className='m-96'>
            Transactions
        </div>
    );
};

export default Transactions;
