import { useEffect, useState } from 'react';

// material-ui
import {
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    InputLabel,
    MenuItem,
    Stack,
    TextField,
    Tooltip
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import AlertBookDelete from './AlertBookDelete';

// third-party
import { Form, FormikProvider, FormikValues, useFormik } from 'formik';
import _ from 'lodash';
import * as Yup from 'yup';

// project imports

import IconButton from 'components/@extended/IconButton';

import { useDispatch, useSelector } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';

// assets
import { DeleteFilled } from '@ant-design/icons';
import { createBook, getBookCode, toInitialState, updateBook } from 'store/reducers/book-master';
import SingleFileUpload from 'components/third-party/dropzone/SingleFile';

// types

// constant
const getInitialValues = (book: FormikValues | null) => {
    const newBook = {
        _id: undefined,
        bookName: '',
        bookCode: '',
        author: '',
        category: '',
        price: '',
        noOfPages: '',
        imageUrl: '',
        status: 'Listed'
    };
    if (book) {
        return _.merge({}, newBook, book);
    }
    return newBook;
};

// ==============================|| Book ADD / EDIT ||============================== //

export interface Props {
    book?: any;
    onCancel: () => void;
}

const AddEditBook = ({ book, onCancel }: Props) => {

    const dispatch = useDispatch();
    const { bookCode, error, isLoading, success } = useSelector(state => state.book)

    const isCreating = !book;

    const BookSchema = Yup.object().shape({
        bookName: Yup.string().max(255).required('Name is required'),
        author: Yup.string().max(255).required('Author is required'),
        category: Yup.string().max(255).required('Category is required'),
        price: Yup.string().max(5).required('Price is required'),
        noOfPages: Yup.string().max(5).required('No of Page is required'),
    });

    const [openAlert, setOpenAlert] = useState(false);

    const handleAlertClose = () => {
        setOpenAlert(!openAlert);
        onCancel();
    };

    const formik = useFormik({
        initialValues: getInitialValues(book!),
        validationSchema: BookSchema,
        enableReinitialize: true,
        onSubmit: (values, { setSubmitting, resetForm }) => {
            try {
                const newBook = {
                    ...values,
                    price: Number(values.price),
                    noOfPages: Number(values.noOfPages),
                };
                if (book) {
                    dispatch(updateBook(newBook));
                } else {
                    dispatch(createBook(newBook));
                }
                resetForm()
                setSubmitting(false);
                onCancel();
            } catch (error) {
                console.error(error);
            }
        }
    });

    const { errors, touched, handleSubmit, isSubmitting, getFieldProps } = formik;

    useEffect(() => {
        dispatch(getBookCode());
    }, [])

    useEffect(() => {
        if (bookCode) {
            formik.setFieldValue('bookCode', bookCode);
        }
    }, [bookCode])


    useEffect(() => {
        if (error != null) {
            let defaultErrorMessage = "ERROR";
            // @ts-ignore
            const errorExp = error as Template1Error
            if (errorExp.message) {
                defaultErrorMessage = errorExp.message
            }
            dispatch(
                openSnackbar({
                    open: true,
                    message: defaultErrorMessage,
                    variant: 'alert',
                    alert: {
                        color: 'error'
                    },
                    close: true
                })
            );
            dispatch(toInitialState());
        }
    }, [error]);

    useEffect(() => {
        if (success != null) {
            dispatch(
                openSnackbar({
                    open: true,
                    message: success,
                    variant: 'alert',
                    alert: {
                        color: 'success'
                    },
                    close: true
                })
            );
            dispatch(toInitialState());
        }
    }, [success])

    if (isLoading) {
        return <>Loading...</>
    }

    return (
        <>
            <FormikProvider value={formik}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
                        <DialogTitle>{book ? 'Edit Book Details' : 'New Book Details'}</DialogTitle>
                        <DialogContent sx={{ p: 2.5 }}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} lg={6}>
                                    <Stack spacing={1.25}>
                                        <InputLabel htmlFor="bookCode"> Book Code</InputLabel>
                                        <TextField
                                            fullWidth
                                            id="bookCode"
                                            placeholder="Enter Book Code"
                                            {...getFieldProps('bookCode')}
                                            error={Boolean(touched.bookCode && errors.bookCode)}
                                            helperText={touched.bookCode && errors.bookCode}
                                        />
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} lg={6}>
                                    <Stack spacing={1.25}>
                                        <InputLabel htmlFor="bookName"> Book Name</InputLabel>
                                        <TextField
                                            fullWidth
                                            id="bookName"
                                            placeholder="Enter Book Name"
                                            {...getFieldProps('bookName')}
                                            error={Boolean(touched.bookName && errors.bookName)}
                                            helperText={touched.bookName && errors.bookName}
                                        />
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} lg={6}>
                                    <Stack spacing={1.25}>
                                        <InputLabel htmlFor="author">Author</InputLabel>
                                        <TextField
                                            fullWidth
                                            id="author"
                                            placeholder="Enter Book Author"
                                            {...getFieldProps('author')}
                                            error={Boolean(touched.author && errors.author)}
                                            helperText={touched.author && errors.author}
                                        />
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} lg={6}>
                                    <Stack spacing={1.25}>
                                        <InputLabel htmlFor="price">Price</InputLabel>
                                        <TextField
                                            fullWidth
                                            id="price"
                                            placeholder="Enter Book Price"
                                            {...getFieldProps('price')}
                                            error={Boolean(touched.price && errors.price)}
                                            helperText={touched.price && errors.price}
                                            type='number'
                                        />
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} lg={6}>
                                    <Stack spacing={1.25}>
                                        <InputLabel htmlFor="noOfPages">No of Page</InputLabel>
                                        <TextField
                                            fullWidth
                                            id="noOfPages"
                                            placeholder="Enter No of Page"
                                            {...getFieldProps('noOfPages')}
                                            error={Boolean(touched.noOfPages && errors.noOfPages)}
                                            helperText={touched.noOfPages && errors.noOfPages}
                                            type='number'
                                        />
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} lg={6}>
                                    <Stack spacing={1.25}>
                                        <InputLabel htmlFor="category">Category</InputLabel>
                                        <TextField
                                            fullWidth
                                            id="category"
                                            select
                                            placeholder="Enter Book Category"
                                            {...getFieldProps('category')}
                                            error={Boolean(touched.category && errors.category)}
                                            helperText={touched.category && errors.category}
                                        >
                                            <MenuItem key={1} value={"Adventure"}>
                                                {"Adventure"}
                                            </MenuItem>
                                            <MenuItem key={2} value={"Novel"}>
                                                {"Novel"}
                                            </MenuItem>
                                            <MenuItem key={3} value={"Short Stories"}>
                                                {"Short Stories"}
                                            </MenuItem>
                                            <MenuItem key={4} value={"Child Story"}>
                                                {"Child Story"}
                                            </MenuItem>
                                            <MenuItem key={5} value={"Educational"}>
                                                {"Educational"}
                                            </MenuItem>
                                            <MenuItem key={6} value={"Religious"}>
                                                {"Religious"}
                                            </MenuItem>
                                            <MenuItem key={7} value={"Astrology"}>
                                                {"Astrology"}
                                            </MenuItem>
                                        </TextField>
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} lg={12}>
                                    <Stack spacing={1.25}>
                                        <InputLabel htmlFor="imageUrl">Image Url</InputLabel>
                                        <SingleFileUpload
                                            sx={{ width: '100%' }}
                                            //@ts-ignore
                                            file={formik.values.imageUrl!}
                                            setFieldValue={formik.setFieldValue}
                                            error={formik.touched.imageUrl && Boolean(formik.errors.imageUrl)}
                                        />
                                    </Stack>
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <Divider />
                        <DialogActions sx={{ p: 2.5 }}>
                            <Grid container justifyContent="space-between" alignItems="center">
                                <Grid item>
                                    {!isCreating && (
                                        <Tooltip title="Delete Book" placement="top">
                                            <IconButton onClick={() => setOpenAlert(true)} size="large" color="error">
                                                <DeleteFilled />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </Grid>
                                <Grid item>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Button color="error" onClick={onCancel}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" variant="contained" disabled={isSubmitting}>
                                            {book ? 'Edit' : 'Add'}
                                        </Button>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </DialogActions>
                    </Form>
                </LocalizationProvider>
            </FormikProvider>
            {!isCreating && <AlertBookDelete title={book.fatherName} open={openAlert} handleClose={handleAlertClose} deleteId={book?.bookId} />}
        </>
    );
};

export default AddEditBook;
