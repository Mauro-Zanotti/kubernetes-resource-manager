import {
    Datagrid,
    EditButton,
    List,
    ShowButton,
    TextField,
    Show,
    SimpleShowLayout,
    DeleteWithConfirmButton,
    useShowController,
    Create,
    SimpleForm,
    TextInput,
    required,
    BooleanInput,
    Edit,
    useEditController,
    useTranslate,
    FormDataConsumer,
    SelectArrayInput,
    AutocompleteArrayInput,
    ArrayField,
    SingleFieldList,
    ChipField,
    NumberInput,
} from 'react-admin';
import { View } from './index';
import { ViewToolbar } from '../components/ViewToolbar';
import {
    CreateTopToolbar,
    EditTopToolbar,
    ListTopToolbar,
    ShowTopToolbar,
} from '../components/toolbars';
import { SimplePageTitle } from './cr';
import { Grid, Typography } from '@mui/material';
import { useCrTransform } from '../hooks/useCrTransform';
import { Breadcrumb } from '@dslab/ra-breadcrumb';
import { NetworkPing } from '@mui/icons-material';

export const CR_POSTGREST = 'postgrests.operator.postgrest.org';

const validateData = (values: any) => {
    const errors: any = {};
    if (!values.metadata.name) {
        errors['metadata.name'] =  'ra.validation.required';
    }
    if (!values.spec.schema) {
        errors['spec.schema'] = 'ra.validation.required';
    }  
    if (values.existing) {
        if (!values.spec.anonRole) {
            errors['spec.anonRole'] = 'ra.validation.required';
        }  
    } else {
        if (!values.tables || values.tables.length === 0) {
            errors['tables'] = 'ra.validation.required';
        }  
        if (!values.grants || values.grants.length === 0) {
            errors['grants'] = 'ra.validation.required';
        }  

    }
    values.connection = values.connection || {};
    if (!values.spec.connection.host) {
        errors['spec.connection.host'] = 'ra.validation.required';
    }
    if (!values.spec.connection.database) {
        errors['spec.connection.database'] = 'ra.validation.required';
    }
    if (values.existingSecret) {
        if (!values.spec.connection.secretName) {
            errors['spec.connection.secretName'] = 'ra.validation.required';
        }
    } else {
        if (!values.spec.connection.user) {
            errors['spec.connection.user'] = 'ra.validation.required';
        }
        if (!values.spec.connection.password) {
            errors['spec.connection.password'] = 'ra.validation.required';
        }
    }
    return errors;
}

const CrCreate = () => {
    const { apiVersion, kind } = useCrTransform();
    const translate = useTranslate();

    const tables: any[] = [];
   
    const transform = (data: any) => {
        if (data.existing) {
            delete data.spec.tables;
            delete data.spec.grants;
        } else {
            delete data.spec.anonRole;
            data.spec.grants = data.grants.join(',');
            data.spec.tables = data.tables.filter((t: any) => !!t);
        }
        if (data.existingSecret) {
            delete data.spec.connection.user;
            delete data.spec.connection.password;
        } else {
            delete data.spec.secretName;
        }
        return {
            ...data,
            apiVersion: apiVersion,
            kind: kind,
        };

    };

    const validate = (values: any) => {
        if (!apiVersion || !kind) {
            return {
                apiVersion: translate('resources.cr.transformError'),
                kind: translate('resources.cr.transformError'),
            };
        }

        return validateData(values);

    };

    return (
        <>
            <Breadcrumb />
            <SimplePageTitle pageType="create" crName={CR_POSTGREST} />
            <Create
                redirect="list"
                actions={<CreateTopToolbar />}
                transform={transform}
            >
                <SimpleForm validate={validate}>
                    <Grid container alignItems="center" spacing={2}>
                        <Grid item xs={4}>
                            <TextInput fullWidth source="metadata.name" validate={required()} />
                        </Grid>
                        <Grid item xs={4}>
                            <TextInput fullWidth source="spec.schema" validate={required()} />
                        </Grid>
                        <Grid item xs={4}>
                            <BooleanInput source="existing" />
                        </Grid>
                    </Grid>
                    <FormDataConsumer>                            
                    {({ formData, ...rest }) => (
                    <>
                        {formData.existing && (
                            <Grid container alignItems="center" spacing={2}>
                                <Grid item xs={4}>
                                    <TextInput fullWidth source="spec.anonRole"  validate={required()}/>
                                </Grid>
                            </Grid>
                        )}
                        {!formData.existing && (
                            <Grid container alignItems="center" spacing={2}>
                                <Grid item xs={4}>
                                    <SelectArrayInput  validate={required()} fullWidth source="grants" choices={[
                                        {id: 'SELECT', name: 'SELECT'},
                                        {id: 'INSERT', name: 'INSERT'},
                                        {id: 'UPDATE', name: 'UPDATE'},
                                        {id: 'DELETE', name: 'DELETE'},
                                    ]} />
                                </Grid>
                                <Grid item xs={4}>
                                    <AutocompleteArrayInput 
                                        source='tables'
                                        choices={tables}
                                        validate={required()} 
                                        onCreate={(n) => {
                                            const t = {id: n?.trim(), name: n?.trim()}
                                            if (n?.trim()) {
                                                tables.push(t);
                                                return t;
                                            }
                                            return null;
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        )}
                    </>
                    )}
                    </FormDataConsumer>

                    <Typography variant="h6" sx={{ paddingTop: '20px' }}>
                        {translate(
                            `resources.${CR_POSTGREST}.fields.spec.connection.title`
                        )}
                    </Typography>
                    <Grid container alignItems="center" spacing={2}>
                        <Grid item xs={4}>
                            <TextInput fullWidth source="spec.connection.host" validate={required()} />
                        </Grid>
                        <Grid item xs={2}>
                            <NumberInput fullWidth source="spec.connection.port"/>
                        </Grid>
                        <Grid item xs={2}>
                            <TextInput fullWidth source="spec.connection.database" validate={required()} />
                        </Grid>
                        <Grid item xs={4}>
                            <BooleanInput source="existingSecret" />
                        </Grid>
                    </Grid>
                    <FormDataConsumer>                            
                    {({ formData, ...rest }) => (
                    <>
                        {formData.existingSecret && (
                            <Grid container alignItems="center" spacing={2}>
                                <Grid item xs={4}>
                                    <TextInput fullWidth source="spec.connection.secretName"  validate={required()}/>
                                </Grid>
                            </Grid>
                        )}
                        {!formData.existingSecret && (
                            <Grid container alignItems="center" spacing={2}>
                                <Grid item xs={4}>
                                    <TextInput fullWidth source="spec.connection.user"  validate={required()}/>
                                </Grid>
                                <Grid item xs={4}>
                                    <TextInput type='password' fullWidth source="spec.connection.password"  validate={required()}/>
                                </Grid>
                            </Grid>
                        )}
                    </>
                    )}
                    </FormDataConsumer>
                    <Grid container alignItems="center" spacing={2}>
                        <Grid item xs={8}>
                            <TextInput fullWidth source="spec.connection.extraParams"/>
                        </Grid>
                    </Grid>

                </SimpleForm>
            </Create>
        </>
    );
};

const CrEdit = () => {
    const translate = useTranslate();
    const { record } = useEditController();
    if (!record) return null;

    const tables = record.spec.tables ? record.spec.tables.map((t: any) => ({id: t, name: t})) : [];
    record.existing = !!record.spec.anonRole;
    record.existingSecret = !!record.spec.connection.secretName;
    record.tables = record.spec.tables;
    record.grants = record.spec.grants ? record.spec.grants.split(',') : [];

    const transform = (data: any) => {
        if (data.existing) {
            delete data.spec.tables;
            delete data.spec.grants;
        } else {
            delete data.spec.anonRole;
            data.spec.grants = data.grants.join(',');
            data.spec.tables = data.tables.filter((t: any) => !!t);
        }
        if (data.existingSecret) {
            delete data.spec.connection.user;
            delete data.spec.connection.password;
        } else {
            delete data.spec.secretName;
        }

        return data;

    };
    return (
        <>
            <Breadcrumb />
            <SimplePageTitle
                pageType="edit"
                crName={CR_POSTGREST}
                crId={record.spec.database}
            />
            <Edit actions={<EditTopToolbar hasYaml />} transform={transform}>
                <SimpleForm toolbar={<ViewToolbar />} validate={validateData}>
                <Grid container alignItems="center" spacing={2}>
                        <Grid item xs={4}>
                            <TextInput fullWidth source="metadata.name" disabled validate={required()} />
                        </Grid>
                        <Grid item xs={4}>
                            <TextInput fullWidth source="spec.schema" validate={required()} />
                        </Grid>
                        <Grid item xs={4}>
                            <BooleanInput source="existing" />
                        </Grid>
                    </Grid>
                    <FormDataConsumer>                            
                    {({ formData, ...rest }) => (
                    <>
                        {formData.existing && (
                            <Grid container alignItems="center" spacing={2}>
                                <Grid item xs={4}>
                                    <TextInput fullWidth source="spec.anonRole"  validate={required()}/>
                                </Grid>
                            </Grid>
                        )}
                        {!formData.existing && (
                            <Grid container alignItems="center" spacing={2}>
                                <Grid item xs={4}>
                                    <SelectArrayInput  validate={required()} fullWidth source="grants" choices={[
                                        {id: 'SELECT', name: 'SELECT'},
                                        {id: 'INSERT', name: 'INSERT'},
                                        {id: 'UPDATE', name: 'UPDATE'},
                                        {id: 'DELETE', name: 'DELETE'},
                                    ]} />
                                </Grid>
                                <Grid item xs={4}>
                                    <AutocompleteArrayInput 
                                        source='tables'
                                        choices={tables}
                                        validate={required()} 
                                        onCreate={(n) => {
                                            const t = {id: n?.trim(), name: n?.trim()}
                                            if (n?.trim()) {
                                                tables.push(t);
                                                return t;
                                            }
                                            return null;
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        )}
                    </>
                    )}
                    </FormDataConsumer>

                    <Typography variant="h6" sx={{ paddingTop: '20px' }}>
                        {translate(
                            `resources.${CR_POSTGREST}.fields.spec.connection.title`
                        )}
                    </Typography>
                    <Grid container alignItems="center" spacing={2}>
                        <Grid item xs={4}>
                            <TextInput fullWidth source="spec.connection.host" validate={required()} />
                        </Grid>
                        <Grid item xs={2}>
                            <NumberInput fullWidth source="spec.connection.port"/>
                        </Grid>
                        <Grid item xs={2}>
                            <TextInput fullWidth source="spec.connection.database" validate={required()} />
                        </Grid>
                        <Grid item xs={4}>
                            <BooleanInput source="existingSecret" />
                        </Grid>
                    </Grid>
                    <FormDataConsumer>                            
                    {({ formData, ...rest }) => (
                    <>
                        {formData.existingSecret && (
                            <Grid container alignItems="center" spacing={2}>
                                <Grid item xs={4}>
                                    <TextInput fullWidth source="spec.connection.secretName"  validate={required()}/>
                                </Grid>
                            </Grid>
                        )}
                        {!formData.existingSecret && (
                            <Grid container alignItems="center" spacing={2}>
                                <Grid item xs={4}>
                                    <TextInput fullWidth source="spec.connection.user"  validate={required()}/>
                                </Grid>
                                <Grid item xs={4}>
                                    <TextInput type='password' fullWidth source="spec.connection.password"  validate={required()}/>
                                </Grid>
                            </Grid>
                        )}
                    </>
                    )}
                    </FormDataConsumer>
                    <Grid container alignItems="center" spacing={2}>
                        <Grid item xs={8}>
                            <TextInput fullWidth source="spec.connection.extraParams"/>
                        </Grid>
                    </Grid>
                </SimpleForm>
            </Edit>
        </>
    );
};

const CrList = () => {
    return (
        <>
            <Breadcrumb />
            <SimplePageTitle pageType="list" crName={CR_POSTGREST} />
            <List actions={<ListTopToolbar />}>
                <Datagrid>
                    <TextField source="id" />
                    <TextField source="spec.connection.database" />
                    <TextField source="spec.schema" />
                    <TextField source="spec.anonRole" />
                    <TextField source="spec.grants" />
                    <TextField source="spec.tables" />
                    <EditButton />
                    <ShowButton />
                    <DeleteWithConfirmButton />
                </Datagrid>
            </List>
        </>
    );
};

const CrShow = () => {
    const { record } = useShowController();
    const translate = useTranslate();
    if (!record) return null;

    return (
        <>
            <Breadcrumb />
            <SimplePageTitle
                pageType="show"
                crName={CR_POSTGREST}
                crId={record.spec.database}
            />
            <Show actions={<ShowTopToolbar hasYaml />}>
                <SimpleShowLayout>
                <TextField source="id" />
                    <TextField source="spec.schema" />
                    <TextField source="spec.anonRole" />
                    <ArrayField label={`resources.${CR_POSTGREST}.fields.grants`} source="glabels" record={{
                         glabels: record.spec.grants ? record.spec.grants.split(',').map((g: any) => ({name: g})) : []    
                    }}>
                         <SingleFieldList linkType={false}>
                            <ChipField source="name" size="small" />
                        </SingleFieldList>
                    </ArrayField>
                    <ArrayField label={`resources.${CR_POSTGREST}.fields.tables`} source="tlabels" record={{
                         tlabels: record.spec.tables ? record.spec.tables.map((t: any) => ({name: t})) : []    
                    }}>
                         <SingleFieldList linkType={false}>
                            <ChipField source="name" size="small" />
                        </SingleFieldList>
                    </ArrayField>
                    <Typography variant="h6" sx={{ paddingTop: '20px' }}>
                        {translate(
                            `resources.${CR_POSTGREST}.fields.spec.connection.title`
                        )}
                    </Typography>
                    <TextField source="spec.connection.host" />
                    <TextField source="spec.connection.port" />
                    <TextField source="spec.connection.database" />
                    <TextField source="spec.connection.secretName" />
                    <TextField source="spec.connection.user" />
                    <TextField source="spec.connection.password" />
                    <TextField source="spec.connection.extraParams" />

                </SimpleShowLayout>
            </Show>
        </>
    );
};


const CustomView: View = {
    key: CR_POSTGREST,
    name: 'PostgREST',
    list: CrList,
    show: CrShow,
    create: CrCreate,
    edit: CrEdit,
    icon: NetworkPing,
};

export default CustomView;
