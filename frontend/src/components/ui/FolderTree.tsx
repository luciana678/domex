import { useEffect, useState } from 'react'

import { Tree } from '@/types'

import DeleteIconMUI from '@mui/icons-material/Delete'
import DescriptionIcon from '@mui/icons-material/DescriptionOutlined'
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined'
import { Box, Card, CardContent, IconButton, Typography } from '@mui/material'
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'
import FolderCopyOutlinedIcon from '@mui/icons-material/FolderCopyOutlined'

import InputSelector from '@/components/InputSelector'

type FileFolderRowProps = {
  tree: Tree
  type: 'folder' | 'file'
  handleClick?: () => void
  handleDeleteFile: (name: Tree) => void
  enableDeleteFile?: boolean
  forceEnableDeleteFile?: boolean
}

const FileFolderRow = ({
  type,
  tree,
  enableDeleteFile = false,
  forceEnableDeleteFile = false,
  handleClick,
  handleDeleteFile,
}: FileFolderRowProps) => {
  const isFolder = type === 'folder'
  const DeleteIcon = isFolder ? DeleteSweepIcon : DeleteIconMUI
  const FolderIcon = isFolder ? FolderOpenOutlinedIcon : DescriptionIcon

  return (
    <div className='flex justify-between'>
      <button
        id={tree.ownerId}
        className={`flex items-center h-8 max-w-[280px] ${
          isFolder ? 'cursor-pointer' : null
        } bg-transparent border-none `}
        onClick={handleClick}>
        <FolderIcon color={tree.name.includes('local') ? 'primary' : ''} />
        <h5 className={`ml-2 text-xs truncate ${!isFolder ? 'font-normal' : ''}`}>{tree.name}</h5>
      </button>

      <div>
        {isFolder && forceEnableDeleteFile && (
          <InputSelector enableEditing isMaster id={tree.ownerId} />
        )}

        {enableDeleteFile && (
          <IconButton
            aria-label='delete'
            size={isFolder ? 'medium' : 'small'}
            color='error'
            disabled={isFolder ? !tree.items?.length : false}
            onClick={() => handleDeleteFile(tree)}>
            <DeleteIcon fontSize='inherit' />
          </IconButton>
        )}
      </div>
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
  const [expand, setExpand] = useState(!!tree.items?.length)

  const enableDelete = forceEnableDeleteFile || (enableDeleteFile && tree.isLocal)

  useEffect(() => setExpand(!!tree.items?.length), [tree.items])

  return (
    <>
      {tree.isFolder ? (
        <div>
          <FileFolderRow
            type='folder'
            tree={tree}
            handleClick={() => setExpand((expand) => !expand)}
            forceEnableDeleteFile={forceEnableDeleteFile}
            enableDeleteFile={enableDelete}
            handleDeleteFile={() => tree.items?.map(handleDeleteFile)}
          />

          <div style={{ display: expand ? 'block' : 'none' }} className='pl-3'>
            {!tree.items?.length ? (
              <Box className='flex flex-row justify-center mt-1 text-center'>
                <FolderCopyOutlinedIcon fontSize='small' color='action' />
                <Typography className='italic text-gray-500 text-xs m-2 mt-[2px]'>
                  Sin archivos...
                </Typography>
              </Box>
            ) : (
              tree.items?.map((item) => {
                return (
                  <FolderTree
                    key={item.name}
                    tree={item}
                    handleDeleteFile={handleDeleteFile}
                    enableDeleteFile={!!enableDelete}
                    forceEnableDeleteFile={forceEnableDeleteFile}
                  />
                )
              })
            )}
          </div>
        </div>
      ) : (
        <div className='pl-3'>
          <FileFolderRow
            type='file'
            tree={tree}
            handleDeleteFile={handleDeleteFile}
            enableDeleteFile={enableDelete}
            forceEnableDeleteFile={forceEnableDeleteFile}
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
