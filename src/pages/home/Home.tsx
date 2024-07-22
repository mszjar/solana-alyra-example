import { useState } from 'react'

import './Home.css'
import Sidebar from '../../components/sidebar/Sidebar'
import Feed from '../../components/feed.tsx/Feed'

function Home({sidebarOpen} : {sidebarOpen: boolean}) {

  const [category, setCategory] =useState<number>(0)
  return (
    <>
    <Sidebar sidebarOpen={sidebarOpen} category={category} setCategory={setCategory}/>
    <div className={`container ${sidebarOpen ? "" :"large-container"}`}>
      <Feed category={category} />
    </div>
    </>
  )
}

export default Home