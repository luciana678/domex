import { Tree } from '@/types'
import DeleteIcon from '@mui/icons-material/Delete'
import DescriptionIcon from '@mui/icons-material/DescriptionOutlined'
import FolderIcon from '@mui/icons-material/Folder'
import { IconButton } from '@mui/material'
import { useState } from 'react'

type FileFolderRowProps = {
  name: string
  type: 'folder' | 'file'
  handleClick?: () => void
  handleDeleteFile?: (name: string) => void
  enableDeleteFile?: boolean
}

const FileFolderRow = ({
  type,
  name,
  enableDeleteFile = true,
  handleClick,
  handleDeleteFile,
}: FileFolderRowProps) => {
  return (
    <div className='flex justify-between w-full'>
      <button
        className={`flex items-center  h-8 ${
          type === 'folder' ? 'pointer' : null
        } bg-transparent border-none `}
        onClick={handleClick}>
        {type === 'folder' ? <FolderIcon /> : <DescriptionIcon />}
        <h5 className='ml-2'>{name}</h5>
      </button>

      {type === 'file' ? (
        <IconButton
          aria-label='delete'
          size='small'
          color='error'
          disabled={!enableDeleteFile}
          onClick={() => handleDeleteFile && handleDeleteFile(name)}>
          <DeleteIcon fontSize='inherit' />
        </IconButton>
      ) : null}
    </div>
  )
}

const FolderTree = ({
  tree,
  handleDeleteFile,
  enableDeleteFile,
}: {
  tree: Tree
  handleDeleteFile: (name: string) => void
  enableDeleteFile: boolean
}) => {
  const [expand, setExpand] = useState(true)
  const handleClick = () => {
    setExpand(!expand)
  }

  return (
    <>
      {tree.isFolder ? (
        <div className=''>
          <FileFolderRow type={'folder'} name={tree.name} handleClick={handleClick} />

          <div style={{ display: expand ? 'block' : 'none' }}>
            {tree.items?.map((item) => {
              return (
                <FolderTree
                  key={item.name}
                  tree={item}
                  handleDeleteFile={handleDeleteFile}
                  enableDeleteFile={enableDeleteFile}
                />
              )
            })}
          </div>
        </div>
      ) : (
        <div className='pl-3'>
          <FileFolderRow
            type={'file'}
            name={tree.name}
            handleDeleteFile={handleDeleteFile}
            enableDeleteFile={enableDeleteFile}
          />
        </div>
      )}
    </>
  )
}

export default FolderTree
