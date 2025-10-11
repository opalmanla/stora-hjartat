import express, { type Request, type Response } from 'express';

const router = express.Router();

router.post('/auth/register', async (req: Request, res: Response) => {
    res.send('Register user');
});
router.post('/auth/login', async (req: Request, res: Response) => {
    res.send('Login user');
});
router.get('/auth/me', async (req: Request, res: Response) => {
    res.send('Get current user');
});
router.get('/ideas', async (req: Request, res: Response) => {
    res.send('Get all ideas');
});
router.get('/ideas/:id', async (req: Request, res: Response) => {
    res.send('Get idea by ID: ' + req.params.id);
});
router.post('/ideas', async (req: Request, res: Response) => {
    res.send('Create idea');
});
router.put('/ideas/:id', async (req: Request, res: Response) => {
    res.send('Update idea: ' + req.params.id);
});
router.delete('/ideas/:id', async (req: Request, res: Response) => {
    res.send('Delete idea: ' + req.params.id);
});
router.post('/ideas/:id/comments', async (req: Request, res: Response) => {
    res.send('Add comment to idea: ' + req.params.id);
});
router.post('/ideas/:id/favorite', async (req: Request, res: Response) => {
    res.send('Favorite idea: ' + req.params.id);
});
router.get('/users/:userId/ideas', async (req: Request, res: Response) => {
    res.send('Get user ideas: ' + req.params.userId);
});
router.get('/users/:userId/favorites', async (req: Request, res: Response) => {
    res.send('Get user favorites: ' + req.params.userId);
});

export default router;