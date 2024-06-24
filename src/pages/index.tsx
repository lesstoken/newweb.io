import { Blog } from '@prisma/client'
import type { NextPage } from 'next'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import useAuth from '../../hooks/useAuth'
import useRoyalty from '../../hooks/useRoyalty'
import useTip from '../../hooks/useTip'
import Loading from '../components/Loading'
import Navbar from '../components/Navbar'
import { trpc } from '../utils/trpc'

const Home: NextPage = () => {
  const { account, accountFound, error } = useAuth()

  const [isPro, setIsPro] = useState<boolean>(false)

  const getAllQuery = trpc.useQuery(['blogs.getAll'])
  const isProQuery = trpc.useQuery([
    'user.isPro',
    { address: account as string }
  ])

  const [blogs, setBlogs] = useState<Array<Blog>>()

  useEffect(() => {
    if (getAllQuery.data && !getAllQuery.isLoading && !getAllQuery.isError) {
      setBlogs(getAllQuery.data)
    }

    if (error) {
      toast.error('Make Sure You Have A Wallet!')
    }

    if (
      isProQuery.data &&
      !isProQuery.isLoading &&
      !isProQuery.isError &&
      isProQuery.data?.isPro
    ) {
      setIsPro(true)
    }
  }, [getAllQuery, isProQuery])

  const { tipCreator, tipCreatorLoading } = useTip()

  const [tipState, setTipState] = useState('')

  const { buy, buyLoading } = useRoyalty()

  if (account && accountFound && buyLoading) return <Loading />

  if (account && accountFound && tipCreatorLoading) return <Loading />

  return (
    <>
      <Navbar />

      <div className='flex flex-col mt-12 max-w-6xl mx-auto'>
        {isPro ? (
          <>
            {blogs?.map((blog) => (
              <div
                key={blog.id}
                className='p-10 bg-slate-50 m-10 rounded-xl cursor-pointer hover:bg-slate-100'
              >
                <Link href={`/post/${blog.id}`}>
                  <a>
                    <span className='font-bold'>Name:</span> {blog.title}
                    <div className='flex justify-end'>
                      <span className='font-bold mr-1'>By:</span>
                      {blog.writerAddress === account
                        ? 'You'
                        : blog.writerAddress}
                    </div>
                  </a>
                </Link>
                <input
                  onChange={(event) => setTipState(event.target.value)}
                  type='text'
                  placeholder='Tip'
                  className='px-5 rounded-lg py-3 font-normal outline-none focus:border-red-200 border-4 border-gray-100'
                />
                <br />
                <button
                  onClick={() => {
                    tipCreator(blog.writerAddress, tipState, blog.id)
                  }}
                  className='bg-red-400 mt-4 text-white px-32 text-md duration-300 transition-all py-5 border-4 rounded-lg hover:bg-transparent hover:text-gray-700 border-red-400'
                >
                  Tip Creator
                </button>

                {blog.isSell && (
                  <button
                    onClick={() => {
                      buy(
                        blog.id,
                        blog.sellAmount.toString(),
                        blog.orignalOwner,
                        blog.writerAddress,
                        blog.tokenUri
                      )
                    }}
                    className='bg-red-400 mt-4 ml-4 text-white px-32 text-md duration-300 transition-all py-5 border-4 rounded-lg hover:bg-transparent hover:text-gray-700 border-red-400'
                  >
                    Buy For {blog.sellAmount} MATIC
                  </button>
                )}
              </div>
            ))}
          </>
        ) : (
          <>
            {account && accountFound ? (
              <>
                {blogs?.map((blog) => (
                  <div key={blog.id}>
                    {!blog.isBlogForPros && (
                      <div className='p-10 bg-slate-50 m-10 rounded-xl cursor-pointer hover:bg-slate-100'>
                        <Link href={`/post/${blog.id}`}>
                          <a>
                            <span className='font-bold'>Name:</span>{' '}
                            {blog.title}
                            <div className='flex justify-end'>
                              <span className='font-bold mr-1'>By:</span>
                              {blog.writerAddress === account
                                ? 'You'
                                : blog.writerAddress}
                            </div>
                          </a>
                        </Link>
                        <input
                          onChange={(event) => setTipState(event.target.value)}
                          type='text'
                          placeholder='Tip'
                          className='px-5 rounded-lg py-3 font-normal outline-none focus:border-red-200 border-4 border-gray-100'
                        />
                        <br />
                        <button
                          onClick={() => {
                            tipCreator(blog.writerAddress, tipState, blog.id)
                          }}
                          className='bg-red-400 mt-4 text-white px-32 text-md duration-300 transition-all py-5 border-4 rounded-lg hover:bg-transparent hover:text-gray-700 border-red-400'
                        >
                          Tip Creator
                        </button>

                        {blog.isSell && (
                          <button
                            onClick={() => {
                              buy(
                                blog.id,
                                blog.sellAmount.toString(),
                                blog.orignalOwner,
                                blog.writerAddress,
                                blog.tokenUri
                              )
                            }}
                            className='bg-red-400 mt-4 ml-4 text-white px-32 text-md duration-300 transition-all py-5 border-4 rounded-lg hover:bg-transparent hover:text-gray-700 border-red-400'
                          >
                            Buy For {blog.sellAmount} MATIC
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </>
            ) : null}
          </>
        )}
      </div>
    </>
  )
}

export default Home
