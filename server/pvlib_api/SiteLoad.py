import numpy as np
import pandas as pd
import Parameters as sp

def findindex(val):
    """ If val is a Column Label return the column index
        else: return -1"""
    try:
        return sp.load_fields.index(val)
    except:
            return -1

class SiteLoad:
    """ A Panda DataFrame Structure containing the Site Energy Load Characteristics"""

    def __init__(self, master= None):
        self.master = master
        self.df = pd.DataFrame(None, None, sp.load_fields)
        self.col_hds = sp.load_fields
        self.col_typs = sp.load_field_types

    def add_new_row(self, rw_vals):
        """ Add new row to DataFrame and coerce entries to correct type """
        assert len(rw_vals) == len(self.col_hds), 'Len rw_vals = {0}, Len Col Hds = {1}'.format(len(rw_vals), len(self.col_hds))
        ind = dict()
        for itm in enumerate(self.col_hds):
            if rw_vals[itm[0]] == None or rw_vals[itm[0]] == "":
                ind[itm[1]] = ""
            else:
                ind[itm[1]] = self.col_typs[itm[0]](rw_vals[itm[0]])
        new_row_df = pd.DataFrame([ind])
        self.df = pd.concat([self.df, new_row_df], ignore_index=True)

    def delete_row(self, rwid):
        """ Delete a row from the dataframe """
        assert rwid < self.df.shape[0]
        self.df.drop(self.df.index[rwid], inplace=True)

    def set_cell_value(self, pos, val):
        """ Update a DataFrame cell value pos = [row,col]  """
        sh = self.df.shape
        row = pos[0]
        col = pos[1]
        if row < sh[0] and pos[1] < sh[1]:
            if val == "":
                self.df.at[row, self.col_hds[col]] = val
            else:
                self.df.at[row, self.col_hds[col]] = self.col_typs[col](val)
            return True
        return False

    def update_row_values(self, rwid, val_list):
        """ Update the contents of the frame row  """
        assert rwid < self.df.shape[0]
        for colid, val in enumerate(val_list):
            self.set_cell_value([rwid, colid], val)

    def get_row_count(self):
        """ Return the row size of the DataFrame """
        return self.df.shape[0]

    def get_dataframe(self):
        """ Return the DataFrame """
        return self.df

    def get_row_by_index(self, i):
        """ Return the ith row of the DataFrame """
        if i < self.get_row_count():
            return list(self.df.iloc[i].values)
        return []

    def drop_row_by_index(self, i):
        """ Update DataFrame by Dropping the row at specified index """
        self.df.drop(self.df.index[i], inplace=True)

    def get_col_indx(self, col_hd):
        """ If col_hd is a valid Column Label return the column index
            else: return -1"""
        try:
            return self.col_hds.index(col_hd)
        except:
            return -1

    def import_frame(self, dfInput):
        """ Rebuild  DataFrame contents from imported data"""

        rws = list(dfInput.keys())
        rws.sort()
        for rw in rws:
            rwDict = dfInput[rw]
            ar = []
            for i in range(len(self.col_hds)):
                dfval = None
                if self.col_typs[i] is str:
                    dfval = ""
                elif self.col_typs[i] is int:
                    dfval = 0
                else:
                    dfval = 0.0
                ar.append(rwDict.pop(self.col_hds[i], dfval))
            self.add_new_row(ar)

    def export_frame(self):
        """ create a dict of DataFrame contents keyed to Rows
            used to save the dataframe contents but not the class code"""
        return self.df.to_dict('Index')
    
    def report_error(self, msg, level, error_class):
        """ Generate Error Report """
        if self.master is None or self.master.stw is None:
            if error_class is None:
                print('{0} Error: {1}'.format(level, msg))
            else:
                raise error_class(msg)
        else:
            self.master.stw.show_message(msg, level)

    def set_std_row_values(self, ar):
        """ Update AR based on change of Load Type """
        if ar[0] != '':
            key = ar[0]
            if key in sp.load_types.keys():
                od = sp.load_types[key]
                for sks in od.keys():
                    indx = self.get_col_indx(sks)
                    if indx > 0:
                        ar[indx] = od[sks]
        return ar

    def get_daily_load(self):
        """ Return the total electrical load for a day """
        return sum(self.get_load_profile()['Total'])

    def get_load_profile(self):
        """ Return a Dataframe of hourly usage by AC, DC and Total Power
            for the given load over a 24 hour period """
        ac_rslt = [0.0]*24
        dc_rslt = [0.0]*24
        tl_rslt = [0.0]*24
        for dfrw in range(self.get_row_count()):
            ac_mode = True
            ldvals = self.get_row_by_index(dfrw)
            if ldvals[sp.load_fields.index('Mode')] == 'DC':
                ac_mode = False            
            hr_wts = (ldvals[sp.load_fields.index('Qty')] *
                      ldvals[sp.load_fields.index('Use Factor')] *
                      ldvals[sp.load_fields.index('Watts')] )
            st = ldvals[sp.load_fields.index('Start Hour')]
            if type(st) is str or st is None:
                st = 0
            hpd = ldvals[sp.load_fields.index('Hours')]
            if type(hpd) is str or hpd is None:
                hpd = 24
            et = hpd + st
            for h in range(24):
                if et < 24:
                    if h >= st and h < et:
                        if ac_mode:
                            ac_rslt[h] += hr_wts
                        else:
                            dc_rslt[h] += hr_wts
                else:
                    if h >= st or h + 24 < et:
                        if ac_mode:
                            ac_rslt[h] += hr_wts
                        else:
                            dc_rslt[h] += hr_wts
        for i in range(24):
            tl_rslt[i] = ac_rslt[i] + dc_rslt[i]
        return pd.DataFrame({'AC': ac_rslt, 'DC': dc_rslt, 'Total':tl_rslt})
    
    def show_load_profile(self, window):
        """ Build & display the load profile graphic """
        elp = self.get_load_profile()
        dmd_hrs = len(elp.loc[elp['Total'] > 0])
        if dmd_hrs > 0:
            pls = 'Peak Hourly Load KW: Total= {0:4.2f},\tAC= {1:4.2f},\tDC= {2:4.2f}'
            pl = pls.format(max(elp['Total'])/1000, (max(elp['AC']))/1000, 
                            (max(elp['DC']))/1000)
            tdls = 'Daily Load KW:           Total= {0:4.2f},\tAC= {1:4.2f},\tDC= {2:4.2f}'
            tdl = tdls.format(sum(elp['Total'])/1000, sum(elp['AC'])/1000, 
                              sum(elp['DC'])/1000)
            avhs = 'Avg Hourly Load KW:  Total= {0:4.2f},\tAC= {1:4.2f},\tDC= {2:4.2f}'
            avhl = avhs.format(sum(elp['Total'])/(1000*dmd_hrs), 
                               sum(elp['AC'])/(1000*dmd_hrs), 
                               sum(elp['DC'])/(1000*dmd_hrs))
            pltlist = [{'label': 'Load', 'data': np.array(elp['Total']),
                            'type': 'Bar', 'color': 'grey', 'width': 0.4,
                            'xaxis':np.array([x for x in range(24)])}]
            # tbf.plot_graphic(window, 'Hour of Day', 'Watts',
            #                       np.array([x for x in range(24)]),
            #             pltlist,'Hourly Electrical Use Profile', (6,4),
            #             text_inserts= [pl,tdl,avhl])

    def get_demand_hours(self):
        elp = self.get_load_profile()
        return len(elp.loc[elp['Total'] > 0])

    def purge_frame(self):
        """ Clear existing load definition data from the underlying DataFrame"""
        self.df = pd.DataFrame(None, None, self.col_hds)

def main():
    sl = SiteLoad()
    sl.add_new_row(['Light, LED', 15, 0.30, "", "", 5.0, 'AC'])
    sl.add_new_row(['Light, LED', 8, 0.85, 2, 6, 5.0, 'AC'])
    sl.add_new_row(['Light, Halogen', 10, 0.95, 5, 18, 35.0, 'AC'])
    sl.add_new_row(['Well Pump DC, 1 HP', 1, 0.35, 12, 8, 500.0, 'DC'])
    sl.add_new_row(['Phone Charger', 10, 0.45, 12, 6, 2.0, 'DC'])
    elp = sl.get_load_profile()
    print(elp)
    print(sl.get_dataframe())

if __name__ == '__main__':
    main()
