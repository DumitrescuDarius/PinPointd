import { useState } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, CircularProgress } from '@mui/material'
import { db } from '../config/firebase'
import { doc, setDoc } from 'firebase/firestore'
import { useTranslation } from 'react-i18next'
import UsernameField from './UsernameField'

interface UsernameDialogProps {
  open: boolean
  userId: string
  onUsernameSet: (username: string) => void
}

const UsernameDialog = ({ open, userId, onUsernameSet }: UsernameDialogProps) => {
  const { t } = useTranslation()
  const [username, setUsername] = useState('')
  const [isValid, setIsValid] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid || !username.trim()) return

    setLoading(true)
    try {
      // Set username in Firestore
      await setDoc(doc(db, 'users', userId), { username: username.trim() }, { merge: true })
      onUsernameSet(username.trim())
    } catch (err: any) {
      console.error('Failed to set username:', err)
    }
    setLoading(false)
  }

  const handleUsernameChange = (value: string, valid: boolean) => {
    setUsername(value)
    setIsValid(valid)
  }

  return (
    <Dialog open={open} disableEscapeKeyDown onClose={() => {}}>
      <DialogTitle>{t('auth.username.title')}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>{t('auth.username.description')}</Typography>
          <UsernameField
            value={username}
            onChange={handleUsernameChange}
            disabled={loading}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            disabled={loading || !isValid}
          >
            {loading ? <CircularProgress size={24} /> : t('auth.username.continue')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default UsernameDialog 