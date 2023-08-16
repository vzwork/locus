import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

import SignIn from './SignIn';
import SignUp from './SignUp';
import Reset from './Reset';


interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function Auth() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const goToSignIn = () => {
    setValue(0)
  }

  const goToSignUp = () => {
    setValue(1)
  }

  const goToReset = () => {
    setValue(2)
  }

  return (
    <Box sx={{ width: '100%' }} bgcolor='secondary.light' color='secondary.contrastText'>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Sign In" {...a11yProps(0)} />
          <Tab label="Sign Up" {...a11yProps(1)} />
          <Tab label="Reset" {...a11yProps(2)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <SignIn goToSignUp={goToSignUp} goToReset={goToReset}/>
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <SignUp goToSignIn={goToSignIn} goToReset={goToReset}/>
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        <Reset goToSignUp={goToSignUp} goToSignIn={goToSignIn}/>
      </CustomTabPanel>
    </Box>
  );
}