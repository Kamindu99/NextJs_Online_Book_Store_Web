/* eslint-disable prettier/prettier */
import { Fragment, MouseEvent, useEffect, useMemo, useState } from 'react';

// material ui
import {
    Button,
    Chip,
    Dialog,
    IconButton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tooltip,
    useMediaQuery,
    useTheme
} from '@mui/material';

// third-party
import { PopupTransition } from 'components/@extended/Transitions';
import { EmptyTable, HeaderSort, SortingSelect, TablePagination, TableParamsType, TableRowSelection } from 'components/third-party/ReactTable';
import { Cell, Column, HeaderGroup, Row, useExpanded, useFilters, useGlobalFilter, usePagination, useRowSelect, useSortBy, useTable } from 'react-table';

import {
    GlobalFilter,
    renderFilterTypes
} from 'utils/react-table';

// project import
import { DeleteTwoTone, EditTwoTone, PlusOutlined } from '@ant-design/icons';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import AddEditCategoryCode from 'sections/parameter-management/category-code/AddEditDisposal';
import { useDispatch, useSelector } from 'store';
import { getCateogyCodeList, toInitialState } from 'store/reducers/category-code';
import { openSnackbar } from 'store/reducers/snackbar';
import { CategoryCodeDTO, queryStringParams } from 'types/category-code';
import { Loading } from 'utils/loading';
import { ReactTableProps, dataProps } from './types/types';
import AlertCategoryDelete from 'sections/parameter-management/category-code/AlertDisposalDelete';

// ==============================|| REACT TABLE ||============================== //

function ReactTable({ columns, data, handleAddEdit, getHeaderProps, tableParams }: ReactTableProps) {
    const theme = useTheme();

    const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
    const sortBy = { id: 'id', desc: false };

    const filterTypes = useMemo(() => renderFilterTypes, []);

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,
        allColumns,
        rows,
        page,
        state: { globalFilter, selectedRowIds, pageIndex },
        preGlobalFilteredRows,
        setGlobalFilter,
        setSortBy,
    } = useTable(
        {
            columns,
            data,
            filterTypes,
            initialState: { pageIndex: tableParams?.page, pageSize: tableParams?.perPage },
            manualPagination: true,
            pageCount: tableParams?.pageCount,
        },
        useGlobalFilter,
        useFilters,
        useSortBy,
        useExpanded,
        usePagination,
        useRowSelect
    );

    return (
        <>
            <TableRowSelection selected={Object.keys(selectedRowIds).length} />
            <Stack spacing={3}>
                <Stack
                    direction={matchDownSM ? 'column' : 'row'}
                    spacing={1}
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ p: 3, pb: 0 }}
                >
                    <GlobalFilter
                        preGlobalFilteredRows={preGlobalFilteredRows}
                        globalFilter={globalFilter}
                        setGlobalFilter={setGlobalFilter}
                        size="small"
                    />
                    <Stack direction={matchDownSM ? 'column' : 'row'} alignItems="center" spacing={1}>
                        <SortingSelect sortBy={sortBy.id} setSortBy={setSortBy} allColumns={allColumns} />
                        <Button variant="contained" startIcon={<PlusOutlined />} onClick={handleAddEdit} size="small">
                            Add New
                        </Button>

                    </Stack>
                </Stack>
                <Table {...getTableProps()}>
                    <TableHead>
                        {headerGroups.map((headerGroup: HeaderGroup<{}>) => (
                            <TableRow {...headerGroup.getHeaderGroupProps()} sx={{ '& > th:first-of-type': { width: '58px' } }}>
                                {headerGroup.headers.map((column: HeaderGroup) => (
                                    <TableCell {...column.getHeaderProps([{ className: column.className }, getHeaderProps(column)])}>
                                        <HeaderSort column={column} />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableHead>
                    <TableBody {...getTableBodyProps()}>
                        {page.length > 0 ? (
                            page.map((row: Row, i: number) => {
                                prepareRow(row);
                                return (
                                    <Fragment key={i}>
                                        <TableRow
                                            {...row.getRowProps()}
                                            onClick={() => {
                                                row.toggleRowSelected();
                                            }}
                                            sx={{ bgcolor: 'inherit' }}
                                        >
                                            {row.cells.map((cell: Cell) => (
                                                <TableCell {...cell.getCellProps([{ className: cell.column.className }])}>{cell.render('Cell')}</TableCell>
                                            ))}
                                        </TableRow>
                                        {/* {row.isExpanded && renderRowSubComponent({ row, rowProps, visibleColumns, expanded })} */}
                                    </Fragment>
                                );
                            })
                        ) : (
                            <EmptyTable msg="No Data" colSpan={9} />
                        )}
                        <TableRow>
                            <TableCell sx={{ p: 2 }} colSpan={12}>
                                <TablePagination
                                    gotoPage={tableParams?.setPage}
                                    rows={rows}
                                    setPageSize={tableParams?.setPerPage}
                                    pageIndex={pageIndex}
                                    pageSize={tableParams?.perPage}
                                    pageCount={tableParams?.pageCount}
                                />
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </Stack>
        </>
    );
}

// ==============================|| List ||============================== //

const CategoryCodeList = () => {

    const dispatch = useDispatch();
    const theme = useTheme();

    const [category, setCategory] = useState<any>(null);
    const [add, setAdd] = useState<boolean>(false);
    const [data, setData] = useState<dataProps[]>([]);

    const handleAdd = () => {
        setAdd(!add);
        if (category && !add) setCategory([]);
    };

    //alert model
    const [openAlert, setOpenAlert] = useState(false);
    const [categoryId, setcategoryId] = useState<string | null>(null)

    const handleAlertClose = () => {
        setOpenAlert(!openAlert);
    };

    const columns = useMemo(
        () =>
            [
                {
                    Header: '#',
                    accessor: 'id',
                    className: 'cell-center',
                    Cell: ({ row }: { row: Row }) => {
                        if (row.id === undefined || row.id === null || row.id === '') {
                            return <>-</>
                        }
                        if (typeof row.id === 'string') {
                            return <>{(parseInt(row.id) + 1).toString()}</>;
                        }
                        if (typeof row.id === 'number') {
                            return <>{row.id + 1}</>;
                        }
                        // Handle any other data types if necessary
                        return <>-</>;
                    }
                },
                {
                    Header: 'Code',
                    accessor: 'categoryCode'
                },
                {
                    Header: 'Name',
                    accessor: 'categoryName'
                },
                {
                    Header: 'Status',
                    accessor: 'isActive',
                    Cell: ({ value }: { value: boolean }) => {
                        switch (value) {
                            case true:
                                return <Chip color="success" label="Active" size="small" />;
                            case false:
                                return <Chip color="error" label="Inactive" size="small" />;
                            default:
                                return <Chip color="info" label="Active" size="small" />;
                        }
                    }
                },
                {
                    id: "actions",
                    Header: 'Actions',
                    accessor: 'actions',
                    className: 'cell-center',
                    Cell: ({ row }: { row: Row }) => {
                        return (
                            <>
                                <Stack direction="row" alignItems="center" justifyContent="center" spacing={0}>
                                    <Tooltip title="Edit">
                                        <IconButton
                                            color="primary"
                                            onClick={(e: MouseEvent<HTMLButtonElement>) => {
                                                const data: CategoryCodeDTO = row.original;
                                                e.stopPropagation();
                                                setCategory({ ...data });
                                                handleAdd();
                                            }}
                                            disabled={row.values?.statusId === 2}
                                        >
                                            <EditTwoTone twoToneColor={theme.palette.primary.main} />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete">
                                        <IconButton
                                            color="error"
                                            onClick={(e: MouseEvent<HTMLButtonElement>) => {
                                                let data: CategoryCodeDTO = row.original;
                                                e.stopPropagation();
                                                setcategoryId(data._id!)
                                                setOpenAlert(true)
                                            }}
                                        >
                                            <DeleteTwoTone twoToneColor={theme.palette.error.main} />
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                            </>
                        )
                    }
                }
            ] as Column[],
        []
    );

    // ----------------------- | API Call - Roles | ---------------------

    const [page, setPage] = useState<number>(0);
    const [perPage, setPerPage] = useState<number>(10);
    const [direction, setDirection] = useState<"asc" | "desc">("desc");
    const [search, setSearch] = useState<string>("");
    const [sort, setSort] = useState<string>("_id");
    const [totalRecords, setTotalRecords] = useState<number>(0);

    const { categoryCodeList, error, isLoading, success } = useSelector((state) => state.categoryCode);

    const tableParams: TableParamsType = {
        page,
        setPage,
        perPage,
        setPerPage,
        direction,
        setDirection,
        sort,
        setSort,
        search,
        setSearch,
        pageCount: totalRecords
    }

    useEffect(() => {
        const listParameters: queryStringParams = {
            page: page,
            per_page: perPage,
            direction: direction,
            sort: sort
        };
        dispatch(getCateogyCodeList(listParameters));
    }, [dispatch, success, page, perPage, direction, sort]);

    useEffect(() => {
        if (!categoryCodeList) {
            setData([])
            return
        }
        if (categoryCodeList == null) {
            setData([])
            return
        }
        setData(categoryCodeList?.result!)
        setTotalRecords(categoryCodeList?.pagination?.total!)
    }, [categoryCodeList])

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
        return <Loading />
    }

    return (
        <>
            <MainCard content={false}>
                <ScrollX>
                    <ReactTable columns={columns} tableParams={tableParams}
                        getHeaderProps={(column: HeaderGroup) => column.getSortByToggleProps()}
                        data={data!} handleAddEdit={handleAdd} />
                </ScrollX>
            </MainCard>
            <Dialog
                maxWidth="sm"
                TransitionComponent={PopupTransition}
                keepMounted
                fullWidth
                onClose={handleAdd}
                open={add}
                sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
                aria-describedby="alert-dialog-slide-description"
            >
                <AddEditCategoryCode categoryCode={category} onCancel={handleAdd} />
            </Dialog>
            {/* alert model */}
            {categoryId && <AlertCategoryDelete title={""} open={openAlert} handleClose={handleAlertClose} deleteId={categoryId} />}
        </>
    )
};

export default CategoryCodeList;
