import csv
import os

import xlsxwriter

TEMP_FILE_NAME = 'temp'

__all__ = ['make_temp_file_path', 'make_travel_data_xlsx', 'make_travel_data_csv']


def make_temp_file_path(filename):
    """
    Make a file path string for the temporary file.
    The location of the temporary file is defined in the system environment field TEMP_FILE_LOCATION
    If it starts with '/', it represents an absolute path to the folder storing temporary files.
    Otherwise, the system environment path is the relative path to the current working directory.

    :param filename: the filename of the temporary file
    :return: a full path to the temporary file
    """
    temp_file_folder_name = os.environ['TEMP_FILE_LOCATION']

    if temp_file_folder_name.startswith('/'):
        temp_file_path = "%s/%s" % (temp_file_folder_name, filename)
    else:
        temp_file_path = "%s/%s/%s" % (os.getcwd(), temp_file_folder_name, filename)

    return temp_file_path


def make_travel_data_xlsx(travel_data_list, args=None):
    """
    Make an xlsx file containing all the travel data in order.
    The xlsx file's first row is the header containing column names 'seg_i', 'from_street', 'to_street', 'path_str',
    'links_length', 'data_length', 'from_tx', 'to_tx', 'mean_spd', 'mean_stddev', 'mean_confidence', 'mean_pct_50'

    :param args: 'time' if work sheet should be created by time_periods. 'seg' if work sheet
                    should be created by segments. Otherwise there will only be 1 worksheet.
    :param travel_data_list: the list of travel data
    :return: the file path of the xlsx file
    """
    filename = "%s.xlsx" % TEMP_FILE_NAME
    file_path = make_temp_file_path(filename)
    travel_data_workbook = xlsxwriter.Workbook(file_path)
    cell_format = travel_data_workbook.add_format()
    cell_format.set_align('center')
    cell_format.set_align('vcenter')

    if args == 'seg':
        worksheet_range = len(travel_data_list)
        worksheet_name_ = "segment_%d"
    elif args == 'time':
        worksheet_range = len(travel_data_list[0])
        worksheet_name_ = "time_period_%d"
    else:
        worksheet_range = 1
        worksheet_name_ = "%d"

    for worksheet_idx in range(worksheet_range):
        worksheet_name = worksheet_name_ % worksheet_idx
        travel_data_worksheet = travel_data_workbook.add_worksheet(worksheet_name)

        travel_data_fields = ['seg_i', 'from_street', 'to_street', 'path_str', 'from_tx', 'to_tx', 'links_length',
                              'data_length', 'mean_spd', 'mean_stddev', 'mean_confidence', 'mean_pct_50']
        for i in range(len(travel_data_fields)):
            travel_data_worksheet.write(0, i, travel_data_fields[i])

        travel_data_worksheet.set_column('A:A', 5, cell_format)
        travel_data_worksheet.set_column('B:C', 15, cell_format)
        travel_data_worksheet.set_column('D:D', 10, cell_format)
        travel_data_worksheet.set_column('E:F', 18, cell_format)
        travel_data_worksheet.set_column('G:I', 10, cell_format)
        travel_data_worksheet.set_column('J:L', 12, cell_format)

        travel_data_worksheet.set_row(0, 15, cell_format)

        row = 1
        col = 0
        if args == 'time':
            for same_time_travel_data in travel_data_list:
                for interval_data in same_time_travel_data[worksheet_idx]:
                    for i in range(len(travel_data_fields)):
                        travel_data_worksheet.write(row, col + i, interval_data[travel_data_fields[i]])

                    travel_data_worksheet.set_row(row, 15, cell_format)
                    row += 1
        elif args == 'seg':
            for segment_data in travel_data_list[worksheet_idx]:
                for segment_tp_data in segment_data:
                    for i in range(len(travel_data_fields)):
                        travel_data_worksheet.write(row, col + i, segment_tp_data[travel_data_fields[i]])

                    travel_data_worksheet.set_row(row, 15, cell_format)
                    row += 1
        else:
            for segment_data in travel_data_list:
                for tp_data in segment_data:
                    for interval_data in tp_data:
                        for i in range(len(travel_data_fields)):
                            travel_data_worksheet.write(row, col + i, interval_data[travel_data_fields[i]])

                        travel_data_worksheet.set_row(row, 15, cell_format)
                        row += 1

    travel_data_workbook.close()
    return file_path


def make_travel_data_csv(travel_data_list):
    """
    Make a csv file containing all the travel data in order.
    The csv has headers 'seg_i', 'from_street', 'to_street', 'path_str', 'links_length', 'data_length',
                        'from_tx', 'to_tx', 'mean_spd', 'mean_stddev', 'mean_confidence', 'mean_pct_50'

    :param travel_data_list: the list of travel data
    :return: the file path of the csv file
    """
    filename = "%s.csv" % TEMP_FILE_NAME
    file_path = make_temp_file_path(filename)

    with open(file_path, 'w', newline='') as csvfile:
        travel_data_fields = ['seg_i', 'from_street', 'to_street', 'path_str', 'from_tx', 'to_tx', 'links_length',
                              'data_length', 'mean_spd', 'mean_stddev', 'mean_confidence', 'mean_pct_50']
        csv_writer = csv.DictWriter(csvfile, fieldnames=travel_data_fields)

        csv_writer.writeheader()
        for segment_data in travel_data_list:
            for travel_data in segment_data:
                for interval_data in travel_data:
                    csv_writer.writerow(interval_data)

        csvfile.flush()

    return file_path
