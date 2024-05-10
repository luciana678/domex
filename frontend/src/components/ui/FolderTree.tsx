import DeleteIconMUI from '@mui/icons-material/Delete'
import DescriptionIcon from '@mui/icons-material/DescriptionOutlined'
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined'
import { Box, Card, CardContent, IconButton, Typography } from '@mui/material'
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'
import FolderCopyOutlinedIcon from '@mui/icons-material/FolderCopyOutlined'

import { Tree } from '@/types'
import { useState } from 'react'

type FileFolderRowProps = {
  tree: Tree
  type: 'folder' | 'file'
  handleClick?: () => void
  handleDeleteFile: (name: Tree) => void
  enableDeleteFile?: boolean
}

const FileFolderRow = ({
  type,
  tree,
  enableDeleteFile = false,
  handleClick,
  handleDeleteFile,
}: FileFolderRowProps) => {
  const DeleteIcon = type === 'folder' ? DeleteSweepIcon : DeleteIconMUI

  return (
    <div className='flex justify-between'>
      <button
        className={`flex items-center h-8 max-w-[280px] ${
          type === 'folder' ? 'cursor-pointer' : null
        } bg-transparent border-none `}
        onClick={handleClick}>
        {type === 'folder' ? <FolderOpenOutlinedIcon /> : <DescriptionIcon />}
        <h5 className={`ml-2 text-xs truncate ${type === 'file' ? 'font-normal' : ''}`}>
          {tree.name}
        </h5>
      </button>

      {enableDeleteFile && (
        <IconButton
          aria-label='delete'
          size={type === 'folder' ? 'medium' : 'small'}
          color='error'
          onClick={() => handleDeleteFile(tree)}>
          <DeleteIcon fontSize='inherit' />
        </IconButton>
      )}
    </div>
  )
}

type FolderTreeProps = {
  tree: Tree
  enableDeleteFile: boolean
  handleDeleteFile: (tree: Tree) => void
  forceEnableDeleteFile?: boolean
}

const FolderTree = ({
  tree,
  handleDeleteFile,
  enableDeleteFile,
  forceEnableDeleteFile,
}: FolderTreeProps) => {
  const [expand, setExpand] = useState(true)
  const handleClick = () => {
    setExpand(!expand)
  }

  const enableDelete = forceEnableDeleteFile || (enableDeleteFile && tree.isLocal)

  return (
    <>
      {tree.isFolder ? (
        <div>
          <FileFolderRow
            type='folder'
            tree={tree}
            handleClick={handleClick}
            enableDeleteFile={enableDelete}
            handleDeleteFile={() => tree.items?.map(handleDeleteFile)}
          />

          <div style={{ display: expand ? 'block' : 'none' }} className='pl-3'>
            {tree.items?.map((item) => {
              return (
                <FolderTree
                  key={item.name}
                  tree={item}
                  handleDeleteFile={handleDeleteFile}
                  enableDeleteFile={!!enableDelete}
                  forceEnableDeleteFile={forceEnableDeleteFile}
                />
              )
            })}
          </div>
        </div>
      ) : (
        <div className='pl-3'>
          <FileFolderRow
            type='file'
            tree={tree}
            handleDeleteFile={handleDeleteFile}
            enableDeleteFile={enableDelete}
          />
        </div>
      )}
    </>
  )
}

export const FolderList = ({
  fileTrees,
  enableDeleteFile = false,
  forceEnableDeleteFile = false,
  handleDeleteFile,
  className,
}: {
  fileTrees: Tree[]
  enableDeleteFile?: boolean
  forceEnableDeleteFile?: boolean
  handleDeleteFile: (name: Tree) => void
  className?: string
}) => {
  return (
    <Card
      className={`bg-white shadow-lg border border-gray-300 rounded-md w-full max-w-[500px] ${className}`}
      variant='outlined'>
      <CardContent>
        <h2 className='text-lg font-semibold text-center mb-3'>Archivos</h2>

        <Box className='max-h-[300px] overflow-auto'>
          {!fileTrees.length ? (
            <Box className='flex flex-col items-center mt-2 '>
              <FolderCopyOutlinedIcon fontSize='large' color='action' />
              <Typography className='mt-2 italic text-gray-500 text-center'>
                Aún no se agregó ningún archivo...
              </Typography>
            </Box>
          ) : (
            fileTrees.map((fileTree) => (
              <FolderTree
                key={fileTree.name}
                tree={fileTree}
                forceEnableDeleteFile={forceEnableDeleteFile}
                enableDeleteFile={enableDeleteFile}
                handleDeleteFile={handleDeleteFile}
              />
            ))
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

export default FolderTree
